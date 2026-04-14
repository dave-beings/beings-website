import { execSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const compositions = [
  'CitationDemo',
  'ComplianceBadges',
  'CustomInstructionsDemo',
  'FileSelectionDemo',
  'FileSelectionDemoV2',
  'FileStorageDemo',
  'FileUploadDemo',
  'InterfaceDemo',
  'KnowledgeArchDemo',
  'OrgSettingsDemo',
  'PromptResponseDemo',
  'ReportDemo',
  'SecurityDemo',
  'TeamDemo',
  'TransparencyDemo',
]

const outDir = './out'
const publicDir = '../public/videos'

mkdirSync(outDir, { recursive: true })
mkdirSync(publicDir, { recursive: true })

for (const id of compositions) {
  const slug = id.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

  for (const codec of ['h264', 'vp8']) {
    const ext = codec === 'h264' ? 'mp4' : 'webm'
    const outFile = `${outDir}/${slug}.${ext}`
    const cmd = `npx remotion render ${id} ${outFile} --codec=${codec}`

    console.log(`\n→ Rendering ${id} (${ext})...`)
    try {
      execSync(cmd, { stdio: 'inherit' })
    } catch (e) {
      console.error(`✗ Failed: ${id} (${ext})`)
    }
  }
}

console.log(`\n→ Copying renders to ${publicDir}...`)
execSync(`cp ${outDir}/*.mp4 ${outDir}/*.webm ${publicDir}/`, { stdio: 'inherit' })
console.log('✓ All done.')
