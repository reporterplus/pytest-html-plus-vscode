// src/renderers/styles.ts
/**
 * CSS styles for the sidebar webview
 */

export function getStyles(): string {
  return `
    :root {
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 12px;
      --spacing-lg: 16px;
      --radius-sm: 3px;
      --radius-md: 6px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-sideBar-background);
      line-height: 1.4;
    }

    .container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Summary Section */
    .summary-section {
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
      background: var(--vscode-sideBarSectionHeader-background, transparent);
    }

    .summary-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-md);
    }

    .summary-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-sideBarSectionHeader-foreground);
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-sm);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      background: var(--vscode-sideBar-background);
    }

    .stat-item svg {
      margin-bottom: 2px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .stat-total {
      color: var(--vscode-foreground);
    }

    .stat-passed {
      color: var(--vscode-testing-iconPassed, #4ec9b0);
    }

    .stat-failed {
      color: var(--vscode-testing-iconFailed, #f14c4c);
    }

    .stat-skipped {
      color: var(--vscode-testing-iconSkipped, #cca700);
    }

    .progress-bar {
      display: flex;
      height: 4px;
      margin-top: var(--spacing-md);
      border-radius: 2px;
      overflow: hidden;
      background: var(--vscode-progressBar-background, rgba(255,255,255,0.1));
    }

    .progress-passed {
      background: var(--vscode-testing-iconPassed, #4ec9b0);
      transition: width 0.3s ease;
    }

    .progress-failed {
      background: var(--vscode-testing-iconFailed, #f14c4c);
      transition: width 0.3s ease;
    }

    /* Test Section (collapsible) */
    .test-section {
      border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
    }

    .test-section.collapsed .test-list {
      display: none;
    }

    .test-section.collapsed .section-chevron {
      transform: rotate(-90deg);
    }

    /* Section Header */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-sm) var(--spacing-lg);
      background: var(--vscode-sideBarSectionHeader-background, transparent);
      border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
    }

    .section-header.clickable {
      cursor: pointer;
      user-select: none;
      transition: background-color 0.1s;
    }

    .section-header.clickable:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .section-header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .section-chevron {
      flex-shrink: 0;
      opacity: 0.7;
      transition: transform 0.15s ease;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-sideBarSectionHeader-foreground);
    }

    .section-count {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      color: #fff;
    }

    /* Test List */
    .test-list {
      flex: 1;
      overflow-y: auto;
    }

    .file-group {
      border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
    }

    .file-group.collapsed .file-tests {
      display: none;
    }

    .file-group.collapsed .chevron {
      transform: rotate(-90deg);
    }

    .file-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-lg);
      cursor: pointer;
      user-select: none;
      transition: background-color 0.1s;
    }

    .file-header:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .chevron {
      flex-shrink: 0;
      opacity: 0.7;
      transition: transform 0.15s ease;
    }

    .file-icon {
      flex-shrink: 0;
      opacity: 0.7;
    }

    .file-name {
      flex: 1;
      font-size: 12px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-count {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
    }

    .file-tests {
      padding-left: var(--spacing-lg);
    }

    .test-item {
      padding: var(--spacing-sm) var(--spacing-lg);
      cursor: pointer;
      transition: background-color 0.1s;
      border-left: 2px solid transparent;
    }

    .test-item:hover {
      background: var(--vscode-list-hoverBackground);
      border-left-color: var(--vscode-testing-iconFailed, #f14c4c);
    }

    .test-item:active {
      background: var(--vscode-list-activeSelectionBackground);
    }

    .test-main {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .test-icon {
      flex-shrink: 0;
    }

    .test-name {
      flex: 1;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .test-duration {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      flex-shrink: 0;
    }

    .test-error-container {
      margin-top: var(--spacing-xs);
      margin-left: 22px;
      pointer-events: none;
    }

    .test-error-container .test-error {
      pointer-events: auto;
    }

    .test-error-container .test-error-toggle {
      pointer-events: auto;
    }

    .test-error {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      font-family: var(--vscode-editor-font-family, monospace);
      line-height: 1.4;
      word-break: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .test-error.expanded {
      display: block;
      -webkit-line-clamp: unset;
      max-height: 300px;
      overflow-y: auto;
      overflow-x: hidden;
      word-wrap: break-word;
      white-space: pre-wrap;
      position: relative;
    }

    /* Error scrollbar styling - ensure it's visible and scrollable */
    .test-error.expanded::-webkit-scrollbar {
      width: 8px;
    }

    .test-error.expanded::-webkit-scrollbar-track {
      background: var(--vscode-scrollbarSlider-background, rgba(255,255,255,0.1));
      border-radius: 4px;
    }

    .test-error.expanded::-webkit-scrollbar-thumb {
      background: var(--vscode-scrollbarSlider-activeBackground, rgba(255,255,255,0.3));
      border-radius: 4px;
    }

    .test-error.expanded::-webkit-scrollbar-thumb:hover {
      background: var(--vscode-scrollbarSlider-hoverBackground, rgba(255,255,255,0.4));
    }

    .test-error-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      padding: 2px 6px;
      border: none;
      background: transparent;
      color: var(--vscode-textLink-foreground);
      font-size: 10px;
      cursor: pointer;
      font-family: var(--vscode-font-family);
      transition: opacity 0.15s;
    }

    .test-error-toggle:hover {
      opacity: 0.8;
      text-decoration: underline;
    }

    .test-error-toggle:active {
      opacity: 0.6;
    }

    .toggle-icon {
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    /* Center Content (empty states) */
    .center-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg) * 2;
      text-align: center;
      flex: 1;
      min-height: 200px;
    }

    .empty-icon,
    .success-icon,
    .error-icon {
      margin-bottom: var(--spacing-lg);
      opacity: 0.6;
    }

    .success-icon {
      opacity: 1;
    }

    .empty-title,
    .success-title,
    .error-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: var(--spacing-sm);
    }

    .success-title {
      color: var(--vscode-testing-iconPassed, #4ec9b0);
    }

    .error-title {
      color: var(--vscode-errorForeground);
    }

    .text-muted {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      margin-bottom: var(--spacing-lg);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      border: none;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-family: var(--vscode-font-family);
      cursor: pointer;
      transition: background-color 0.1s, opacity 0.1s;
      white-space: nowrap;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .btn:active {
      opacity: 0.8;
    }

    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .btn-primary:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn-secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      padding: 0;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--vscode-foreground);
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.1s, background-color 0.1s;
    }

    .icon-btn:hover {
      opacity: 1;
      background: var(--vscode-toolbar-hoverBackground);
    }

    .error-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    /* Loading */
    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 2px solid var(--vscode-progressBar-background);
      border-top-color: var(--vscode-progressBar-background);
      border-right-color: var(--vscode-button-background);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: var(--spacing-lg);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--vscode-scrollbarSlider-background);
      border-radius: 5px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--vscode-scrollbarSlider-hoverBackground);
    }

    ::-webkit-scrollbar-thumb:active {
      background: var(--vscode-scrollbarSlider-activeBackground);
    }
  `;
}
