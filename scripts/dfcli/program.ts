import { Command } from 'commander';
import { registerImageCommands } from './commands/images.ts';
import { registerMaintainCommands } from './commands/maintain.ts';
import { registerManifestCommands } from './commands/manifest.ts';
import { registerRepoCommands } from './commands/repo.ts';
import { registerProjectCommands } from './commands/project.ts';

/** Build the dfcli command tree; each area registers its own commands. */
export function buildProgram() {
  const program = new Command()
    .name('dfcli')
    .description('Inspect, maintain and publish the dockerfiles images')
    .showHelpAfterError()
    .showSuggestionAfterError();
  registerImageCommands(program);
  registerManifestCommands(program);
  registerRepoCommands(program);
  registerProjectCommands(program);
  registerMaintainCommands(program);
  return program;
}
