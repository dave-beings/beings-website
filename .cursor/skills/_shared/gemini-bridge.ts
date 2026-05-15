#!/usr/bin/env npx tsx
/**
 * Gemini Bridge - Shared CDP Infrastructure (v5.1)
 * 
 * SSOT for all Gemini web UI automation.
 * Used by: second-opinion, test-guardian, and future skills.
 * 
 * v5.1 Changes:
 *   - Thread safety: --thread <chatId> targets a specific conversation
 *   - Fails fast if chat ID doesn't match any open tab URL
 *   - Warns when multiple Gemini tabs open without --thread
 * 
 * v5.0 Changes:
 *   - Target selection filters by type='page' (avoids iframe/service worker targets)
 *   - Auto-recovery from stuck generations before sending
 *   - Added --stop command to abort active generation
 *   - stopGeneration() uses physical mouse events (not JS .click())
 * 
 * v4.4 Changes:
 *   - Added --attach flag for file/image attachments
 *   - Uses DOM.setFileInputFiles for reliable file upload
 * 
 * v4.3 Changes:
 *   - Added --file flag to read prompt from file (handles long/complex prompts)
 *   - Moved to _shared/ for DRY compliance
 *   - Exported functions for programmatic use
 * 
 * v4.2 Changes:
 *   - Improved response selector: targets structured-content-container directly
 *   - Avoids "Show thinking" button text in extraction
 * 
 * Prerequisites:
 *   - Chrome running with: --remote-debugging-port=9222
 *   - Gemini tab open and logged in
 * 
 * Usage:
 *   npx tsx gemini-bridge.ts --send "Your prompt"              # Send inline prompt
 *   npx tsx gemini-bridge.ts --file ./prompt.txt               # Send prompt from file
 *   npx tsx gemini-bridge.ts --attach ./image.png "Describe"   # Attach file + prompt
 *   npx tsx gemini-bridge.ts --read                            # Read latest response
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export const CONFIG = {
  cdpPort: 9222,
  responseTimeoutMs: 90000,
  stabilityChecks: 3,
  stabilityIntervalMs: 2000,
};

// CDP connection
export async function connectToChrome(threadId?: string) {
  const CDP = (await import('chrome-remote-interface')).default;
  const targets = await CDP.List({ port: CONFIG.cdpPort });
  // v5.1: Filter by type='page' to avoid connecting to iframes/service workers
  const geminiTargets = targets.filter((t: any) => 
    t.url.includes('gemini.google.com') && t.type === 'page'
  );
  
  if (geminiTargets.length === 0) {
    throw new Error('No Gemini tab found. Please open gemini.google.com in Chrome.');
  }
  
  // v5.1: Thread safety — verify we're connecting to the right conversation
  if (threadId) {
    const matched = geminiTargets.find((t: any) => t.url.includes(threadId));
    if (!matched) {
      const urls = geminiTargets.map((t: any) => t.url).join('\n  ');
      throw new Error(
        `Thread mismatch! Expected chat ID "${threadId}" but found:\n  ${urls}\n` +
        `Navigate to the correct Gemini conversation or omit --thread.`
      );
    }
    return await CDP({ port: CONFIG.cdpPort, target: matched.id });
  }
  
  // No thread specified — warn if multiple tabs exist
  if (geminiTargets.length > 1) {
    const urls = geminiTargets.map((t: any) => `  ${t.url}`).join('\n');
    console.error(
      `⚠ WARNING: ${geminiTargets.length} Gemini tabs open. Using first match.\n` +
      `  Use --thread <chatId> to target a specific conversation.\n` +
      `  Open tabs:\n${urls}`
    );
  }
  
  return await CDP({ port: CONFIG.cdpPort, target: geminiTargets[0].id });
}

// Check if user is signed in
export async function verifyGeminiState(client: any): Promise<{ ok: boolean; error?: string }> {
  const { Runtime } = client;
  
  const result = await Runtime.evaluate({
    expression: `(() => {
      const signIn = document.querySelector('[data-test-id="sign-in-button"], [aria-label="Sign in"]');
      if (signIn) return { ok: false, error: 'Not signed in. Please sign in to Gemini.' };
      
      const input = document.querySelector('rich-textarea, [contenteditable="true"]');
      if (!input) return { ok: false, error: 'Gemini not ready. Cannot find input field.' };
      
      return { ok: true };
    })()`,
    returnByValue: true,
  });
  
  return result.result.value;
}

// Stop any in-progress generation
export async function stopGeneration(client: any): Promise<boolean> {
  const { Runtime, Input, DOM } = client;
  
  const checkResult = await Runtime.evaluate({
    expression: `(() => {
      const stopBtn = document.querySelector('button[aria-label="Stop response"]');
      return { generating: !!stopBtn };
    })()`,
    returnByValue: true,
  });
  
  if (!checkResult.result.value.generating) return false;
  
  // Use physical click (JS .click() doesn't always register in Angular)
  const { root } = await DOM.getDocument();
  const { nodeId } = await DOM.querySelector({
    nodeId: root.nodeId,
    selector: 'button[aria-label="Stop response"]'
  });
  
  if (nodeId) {
    const { model } = await DOM.getBoxModel({ nodeId });
    const x = (model.content[0] + model.content[4]) / 2;
    const y = (model.content[1] + model.content[5]) / 2;
    await Input.dispatchMouseEvent({ type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await Input.dispatchMouseEvent({ type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }
  
  // Wait for generation to stop (up to 5s)
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const recheck = await Runtime.evaluate({
      expression: `!document.querySelector('button[aria-label="Stop response"]')`,
      returnByValue: true,
    });
    if (recheck.result.value) return true;
  }
  
  return false;
}

// Send message using CDP native Input.insertText
export async function sendMessage(client: any, prompt: string): Promise<void> {
  const { Runtime, Input, DOM } = client;
  
  // v5.0: Auto-recover from stuck generation before sending
  const wasGenerating = await stopGeneration(client);
  if (wasGenerating) {
    await new Promise(r => setTimeout(r, 1000));
  }
  
  const selector = 'rich-textarea, div[contenteditable="true"], [role="textbox"]';
  
  // Get document root and find editor node
  const { root } = await DOM.getDocument();
  const { nodeId } = await DOM.querySelector({
    nodeId: root.nodeId,
    selector: selector
  });
  
  if (!nodeId) {
    throw new Error(`Editor not found with selector: ${selector}`);
  }
  
  // Get box model for precise coordinates
  const { model } = await DOM.getBoxModel({ nodeId });
  const x = (model.content[0] + model.content[4]) / 2;
  const y = (model.content[1] + model.content[5]) / 2;
  
  // Click to establish focus
  await Input.dispatchMouseEvent({ type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await Input.dispatchMouseEvent({ type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  
  await new Promise(r => setTimeout(r, 200));
  
  // Clear existing content
  await Input.dispatchKeyEvent({ type: 'keyDown', modifiers: 4, key: 'a', code: 'KeyA' });
  await Input.dispatchKeyEvent({ type: 'keyUp', modifiers: 4, key: 'a', code: 'KeyA' });
  await Input.dispatchKeyEvent({ type: 'keyDown', key: 'Backspace', code: 'Backspace' });
  await Input.dispatchKeyEvent({ type: 'keyUp', key: 'Backspace', code: 'Backspace' });
  
  await new Promise(r => setTimeout(r, 100));
  
  // Insert text via CDP
  await Input.insertText({ text: prompt });
  
  // Wake Angular's change detection
  const wakeResult = await Runtime.evaluate({
    expression: `(() => {
      const el = document.querySelector('${selector}');
      if (!el) return { ok: false, error: 'Element lost after insertion' };
      
      el.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: false,
        inputType: 'insertText'
      }));
      
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Unidentified' }));
      
      return { ok: true, textLength: el.innerText?.length || 0 };
    })()`,
    returnByValue: true
  });
  
  if (!wakeResult.result.value.ok) {
    throw new Error(wakeResult.result.value.error || 'Failed to wake framework');
  }
  
  await new Promise(r => setTimeout(r, 300));
  
  // Click Send
  const sendResult = await Runtime.evaluate({
    expression: `(() => {
      const sendBtn = document.querySelector('button[aria-label="Send message"]');
      if (!sendBtn) return { ok: false, error: 'Send button not found' };
      if (sendBtn.disabled) return { ok: false, error: 'Send button disabled', textInEditor: document.querySelector('${selector}')?.innerText?.length || 0 };
      
      sendBtn.click();
      return { ok: true, sent: true };
    })()`,
    returnByValue: true
  });
  
  if (!sendResult.result.value.ok) {
    throw new Error(sendResult.result.value.error || 'Failed to send');
  }
  
  // Verify message appeared
  await new Promise(r => setTimeout(r, 500));
  
  const verifyResult = await Runtime.evaluate({
    expression: `(() => {
      const userMessages = document.querySelectorAll('[data-message-author-role="user"], .user-message, .query-content');
      if (userMessages.length === 0) {
        const editor = document.querySelector('${selector}');
        const editorEmpty = !editor?.innerText?.trim();
        if (editorEmpty) {
          return { ok: true, method: 'editor-cleared' };
        }
        return { ok: false, error: 'Message not found in conversation.' };
      }
      return { ok: true, method: 'user-message-found', count: userMessages.length };
    })()`,
    returnByValue: true
  });
  
  if (!verifyResult.result.value.ok) {
    throw new Error(verifyResult.result.value.error || 'Post-send verification failed');
  }
}

// Wait for response to complete
export async function waitForResponse(client: any): Promise<void> {
  const { Runtime } = client;
  const startTime = Date.now();
  let lastSignature = '';
  let stableChecks = 0;
  
  await new Promise(r => setTimeout(r, 2000));
  
  while (Date.now() - startTime < CONFIG.responseTimeoutMs) {
    const result = await Runtime.evaluate({
      expression: `(() => {
        const stopBtn = document.querySelector('button[aria-label="Stop response"]');
        if (stopBtn) return { generating: true, signature: '' };
        
        const responses = document.querySelectorAll('structured-content-container.model-response-text, .response-content');
        const lastLen = responses.length > 0 ? responses[responses.length - 1].innerText.length : 0;
        
        return { 
          generating: false, 
          signature: responses.length + '-' + lastLen 
        };
      })()`,
      returnByValue: true,
    });
    
    const { generating, signature } = result.result.value;
    
    if (generating) {
      stableChecks = 0;
      await new Promise(r => setTimeout(r, CONFIG.stabilityIntervalMs));
      continue;
    }
    
    if (signature === lastSignature && signature !== '') {
      stableChecks++;
      if (stableChecks >= CONFIG.stabilityChecks) {
        return;
      }
    } else {
      stableChecks = 0;
    }
    
    lastSignature = signature;
    await new Promise(r => setTimeout(r, CONFIG.stabilityIntervalMs));
  }
  
  throw new Error(`Timeout waiting for response (${CONFIG.responseTimeoutMs / 1000}s)`);
}

// Extract the last response
export async function getLastResponse(client: any): Promise<string> {
  const { Runtime } = client;
  
  await Runtime.evaluate({ expression: `window.scrollTo(0, document.body.scrollHeight)` });
  await new Promise(r => setTimeout(r, 500));
  
  const result = await Runtime.evaluate({
    expression: `(() => {
      let responses = document.querySelectorAll('structured-content-container.model-response-text');
      let usedPrecise = true;
      
      if (responses.length === 0) {
        responses = document.querySelectorAll('.response-content, .model-response');
        usedPrecise = false;
      }
      
      if (responses.length === 0) return { ok: false, error: 'No responses found' };
      
      const lastResponse = responses[responses.length - 1];
      let content = lastResponse.innerText.trim();
      
      if (!usedPrecise) {
        content = content.replace(/^Show thinking\\n\\n/, '');
      }
      
      return { ok: true, content, usedPrecise };
    })()`,
    returnByValue: true,
  });
  
  if (!result.result.value.ok) {
    throw new Error(result.result.value.error || 'Failed to extract response');
  }
  
  return result.result.value.content;
}

// Attach a file to the conversation
export async function attachFile(client: any, filePath: string): Promise<void> {
  const { Runtime, DOM, Input } = client;
  
  // Resolve to absolute path
  const absolutePath = resolve(filePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }
  
  // Step 1: Click the "Add files" button to open the menu
  // Note: Gemini uses custom attributes, not standard aria-label
  const openMenuResult = await Runtime.evaluate({
    expression: `(() => {
      // Try multiple selectors for the Add files button
      let addFilesBtn = document.querySelector('button[aria-label="Open upload file menu"]');
      if (!addFilesBtn) {
        addFilesBtn = Array.from(document.querySelectorAll('button')).find(
          btn => btn.textContent?.includes('Add files') || 
                 btn.getAttribute('data-tooltip')?.includes('Add files')
        );
      }
      if (!addFilesBtn) return { ok: false, error: 'Add files button not found' };
      addFilesBtn.click();
      return { ok: true };
    })()`,
    returnByValue: true
  });
  
  if (!openMenuResult.result.value.ok) {
    throw new Error(openMenuResult.result.value.error || 'Failed to open file menu');
  }
  
  await new Promise(r => setTimeout(r, 300));
  
  // Step 2: Click "Upload files" option
  const clickUploadResult = await Runtime.evaluate({
    expression: `(() => {
      // Look for the upload files button in the menu
      const uploadBtn = Array.from(document.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('Upload files') || 
               btn.getAttribute('aria-label')?.includes('Upload files')
      );
      if (!uploadBtn) return { ok: false, error: 'Upload files button not found in menu' };
      uploadBtn.click();
      return { ok: true };
    })()`,
    returnByValue: true
  });
  
  if (!clickUploadResult.result.value.ok) {
    throw new Error(clickUploadResult.result.value.error || 'Failed to click upload files');
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  // Step 3: Find the hidden file input and set files via CDP
  const { root } = await DOM.getDocument();
  const { nodeId } = await DOM.querySelector({
    nodeId: root.nodeId,
    selector: 'input[type="file"][name="Filedata"], input[type="file"]'
  });
  
  if (!nodeId) {
    throw new Error('File input not found after clicking upload');
  }
  
  // Step 4: Set the file using DOM.setFileInputFiles
  await DOM.setFileInputFiles({
    files: [absolutePath],
    nodeId: nodeId
  });
  
  // Step 5: Wait for file to be processed (look for thumbnail/preview)
  await new Promise(r => setTimeout(r, 1000));
  
  const verifyResult = await Runtime.evaluate({
    expression: `(() => {
      // Look for upload confirmation (file chip, thumbnail, or preview)
      const fileChip = document.querySelector('[data-file-chip], .file-chip, .uploaded-file, [class*="attachment"]');
      const thumbnail = document.querySelector('img[src*="blob:"], img[class*="preview"], img[class*="thumbnail"]');
      const uploadingIndicator = document.querySelector('[class*="uploading"], [class*="loading"]');
      
      if (uploadingIndicator) {
        return { ok: false, uploading: true };
      }
      
      if (fileChip || thumbnail) {
        return { ok: true, method: fileChip ? 'file-chip' : 'thumbnail' };
      }
      
      // Fallback: check if input has files
      const input = document.querySelector('input[type="file"]');
      if (input?.files?.length > 0) {
        return { ok: true, method: 'input-files' };
      }
      
      return { ok: false, error: 'Could not verify file upload' };
    })()`,
    returnByValue: true
  });
  
  // Wait for upload to complete if still uploading
  if (verifyResult.result.value.uploading) {
    await new Promise(r => setTimeout(r, 2000));
  }
}

// High-level: Send prompt and get response
export async function sendAndReceive(prompt: string, attachments?: string[], threadId?: string): Promise<string> {
  let client: any;
  
  try {
    client = await connectToChrome(threadId);
    
    const state = await verifyGeminiState(client);
    if (!state.ok) {
      throw new Error(state.error);
    }
    
    // Attach files first if provided
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        await attachFile(client, file);
      }
    }
    
    const timestampedPrompt = `[TIMESTAMP: ${new Date().toISOString()}]\n\n${prompt}`;
    await sendMessage(client, timestampedPrompt);
    await waitForResponse(client);
    return await getLastResponse(client);
    
  } finally {
    if (client) await client.close();
  }
}

// High-level: Read latest response only
export async function readLatest(threadId?: string): Promise<string> {
  let client: any;
  
  try {
    client = await connectToChrome(threadId);
    
    const state = await verifyGeminiState(client);
    if (!state.ok) {
      throw new Error(state.error);
    }
    
    return await getLastResponse(client);
    
  } finally {
    if (client) await client.close();
  }
}

// CLI argument parser
const args = process.argv.slice(2);

// v5.1: Extract --thread from any position in args
function getThreadId(): string | undefined {
  const idx = args.indexOf('--thread');
  if (idx === -1) return undefined;
  const id = args[idx + 1];
  if (!id || id.startsWith('--')) {
    console.error('Error: --thread requires a chat ID (e.g., --thread 95ded7d430f70be2)');
    process.exit(1);
  }
  return id;
}
const threadId = getThreadId();

if (args.includes('--send')) {
  const sendIdx = args.indexOf('--send');
  const prompt = args[sendIdx + 1];
  
  if (!prompt) {
    console.error('Error: --send requires a prompt argument');
    process.exit(1);
  }
  
  sendAndReceive(prompt, undefined, threadId)
    .then(response => console.log(response))
    .catch(err => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
  
} else if (args.includes('--file')) {
  const fileIdx = args.indexOf('--file');
  const filePath = args[fileIdx + 1];
  
  if (!filePath) {
    console.error('Error: --file requires a file path argument');
    process.exit(1);
  }
  
  try {
    const prompt = readFileSync(filePath, 'utf-8');
    sendAndReceive(prompt, undefined, threadId)
      .then(response => console.log(response))
      .catch(err => {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      });
  } catch (err: any) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  }
  
} else if (args.includes('--attach')) {
  const attachIdx = args.indexOf('--attach');
  const filePath = args[attachIdx + 1];
  const prompt = args[attachIdx + 2];
  
  if (!filePath) {
    console.error('Error: --attach requires a file path argument');
    process.exit(1);
  }
  
  if (!prompt) {
    console.error('Error: --attach requires a prompt after the file path');
    console.error('Usage: --attach <file> "prompt"');
    process.exit(1);
  }
  
  sendAndReceive(prompt, [filePath], threadId)
    .then(response => console.log(response))
    .catch(err => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
  
} else if (args.includes('--stop')) {
  (async () => {
    let client: any;
    try {
      client = await connectToChrome(threadId);
      const stopped = await stopGeneration(client);
      console.log(stopped ? 'Generation stopped.' : 'No active generation.');
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    } finally {
      if (client) await client.close();
    }
  })();

} else if (args.includes('--read')) {
  readLatest(threadId)
    .then(response => console.log(response))
    .catch(err => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
  
} else {
  console.log(`Gemini Bridge v5.1 - Shared CDP Infrastructure

Usage:
  npx tsx gemini-bridge.ts --send "prompt"                          Send inline prompt
  npx tsx gemini-bridge.ts --send "prompt" --thread <chatId>        Send to specific thread
  npx tsx gemini-bridge.ts --file <path> --thread <chatId>          Send file to specific thread
  npx tsx gemini-bridge.ts --attach <file> "prompt"                 Attach file + send prompt
  npx tsx gemini-bridge.ts --read                                   Read latest response
  npx tsx gemini-bridge.ts --read --thread <chatId>                 Read from specific thread
  npx tsx gemini-bridge.ts --stop                                   Stop active generation

Thread Safety:
  --thread <chatId>   Target a specific Gemini conversation by its URL chat ID.
                      e.g., --thread 95ded7d430f70be2
                      Fails fast if the chat ID doesn't match any open Gemini tab.
                      Without --thread, warns if multiple Gemini tabs are open.

Programmatic:
  import { sendAndReceive, readLatest } from './_shared/gemini-bridge';
  const response = await sendAndReceive(prompt, ['./image.png'], 'chatId123');

Prerequisites:
  - Chrome with: --remote-debugging-port=9222
  - Gemini tab open and signed in
`);
}
