import React from 'react'
import { Composition } from 'remotion'

import * as Citation from './CitationDemo'
import * as Compliance from './ComplianceBadges'
import * as CustomInstructions from './CustomInstructionsDemo'
import * as FileSelection from './FileSelectionDemo'
import * as FileSelectionV2 from './FileSelectionDemoV2'
import * as FileStorage from './FileStorageDemo'
import * as FileUpload from './FileUploadDemo'
import * as Interface from './InterfaceDemo'
import * as KnowledgeArch from './KnowledgeArchDemo'
import * as OrgSettings from './OrgSettingsDemo'
import * as PromptResponse from './PromptResponseDemo'
import * as Report from './ReportDemo'
import * as Security from './SecurityDemo'
import * as Team from './TeamDemo'
import * as Transparency from './TransparencyDemo'

/**
 * All marketing demos that use Remotion compositions (matches widget bundles except `aida-chat`,
 * which is a non-Remotion React hero).
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CitationDemo"
        component={Citation.CitationDemo}
        durationInFrames={Citation.DURATION_IN_FRAMES}
        fps={Citation.FPS}
        width={Citation.COMPOSITION_WIDTH}
        height={Citation.COMPOSITION_HEIGHT}
      />
      <Composition
        id="ComplianceBadges"
        component={Compliance.ComplianceBadges}
        durationInFrames={Compliance.DURATION_IN_FRAMES}
        fps={Compliance.FPS}
        width={Compliance.COMPOSITION_WIDTH}
        height={Compliance.COMPOSITION_HEIGHT}
      />
      <Composition
        id="CustomInstructionsDemo"
        component={CustomInstructions.CustomInstructionsDemo}
        durationInFrames={CustomInstructions.DURATION_IN_FRAMES}
        fps={CustomInstructions.FPS}
        width={CustomInstructions.COMPOSITION_WIDTH}
        height={CustomInstructions.COMPOSITION_HEIGHT}
      />
      <Composition
        id="FileSelectionDemo"
        component={FileSelection.FileSelectionDemo}
        durationInFrames={FileSelection.DURATION_IN_FRAMES}
        fps={FileSelection.FPS}
        width={FileSelection.COMPOSITION_WIDTH}
        height={FileSelection.COMPOSITION_HEIGHT}
      />
      <Composition
        id="FileSelectionDemoV2"
        component={FileSelectionV2.FileSelectionDemoV2}
        durationInFrames={FileSelectionV2.DURATION_IN_FRAMES}
        fps={FileSelectionV2.FPS}
        width={FileSelectionV2.COMPOSITION_WIDTH}
        height={FileSelectionV2.COMPOSITION_HEIGHT}
      />
      <Composition
        id="FileStorageDemo"
        component={FileStorage.FileStorageDemo}
        durationInFrames={FileStorage.DURATION_IN_FRAMES}
        fps={FileStorage.FPS}
        width={FileStorage.COMPOSITION_WIDTH}
        height={FileStorage.COMPOSITION_HEIGHT}
      />
      <Composition
        id="FileUploadDemo"
        component={FileUpload.FileUploadDemo}
        durationInFrames={FileUpload.DURATION_IN_FRAMES}
        fps={FileUpload.FPS}
        width={FileUpload.COMPOSITION_WIDTH}
        height={FileUpload.COMPOSITION_HEIGHT}
      />
      <Composition
        id="InterfaceDemo"
        component={Interface.InterfaceDemo}
        durationInFrames={Interface.DURATION_IN_FRAMES}
        fps={Interface.FPS}
        width={Interface.COMPOSITION_WIDTH}
        height={Interface.COMPOSITION_HEIGHT}
      />
      <Composition
        id="KnowledgeArchDemo"
        component={KnowledgeArch.KnowledgeArchDemo}
        durationInFrames={KnowledgeArch.DURATION_IN_FRAMES}
        fps={KnowledgeArch.FPS}
        width={KnowledgeArch.COMPOSITION_WIDTH}
        height={KnowledgeArch.COMPOSITION_HEIGHT}
      />
      <Composition
        id="OrgSettingsDemo"
        component={OrgSettings.OrgSettingsDemo}
        durationInFrames={OrgSettings.DURATION_IN_FRAMES}
        fps={OrgSettings.FPS}
        width={OrgSettings.COMPOSITION_WIDTH}
        height={OrgSettings.COMPOSITION_HEIGHT}
      />
      <Composition
        id="PromptResponseDemo"
        component={PromptResponse.PromptResponseDemo}
        durationInFrames={PromptResponse.DURATION_IN_FRAMES}
        fps={PromptResponse.FPS}
        width={PromptResponse.COMPOSITION_WIDTH}
        height={PromptResponse.COMPOSITION_HEIGHT}
      />
      <Composition
        id="ReportDemo"
        component={Report.ReportDemo}
        durationInFrames={Report.DURATION_IN_FRAMES}
        fps={Report.FPS}
        width={Report.COMPOSITION_WIDTH}
        height={Report.COMPOSITION_HEIGHT}
      />
      <Composition
        id="SecurityDemo"
        component={Security.SecurityDemo}
        durationInFrames={Security.DURATION_IN_FRAMES}
        fps={Security.FPS}
        width={Security.COMPOSITION_WIDTH}
        height={Security.COMPOSITION_HEIGHT}
      />
      <Composition
        id="TeamDemo"
        component={Team.TeamDemo}
        durationInFrames={Team.DURATION_IN_FRAMES}
        fps={Team.FPS}
        width={Team.COMPOSITION_WIDTH}
        height={Team.COMPOSITION_HEIGHT}
      />
      <Composition
        id="TransparencyDemo"
        component={Transparency.TransparencyDemo}
        durationInFrames={Transparency.DURATION_IN_FRAMES}
        fps={Transparency.FPS}
        width={Transparency.COMPOSITION_WIDTH}
        height={Transparency.COMPOSITION_HEIGHT}
      />
    </>
  )
}
