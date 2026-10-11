import type { Command } from 'commander';
import { runProject, type ProjectAction } from '../lib/project.ts';
import { root } from '../lib/repo.ts';

/** Local Make/Bake actions, shared by root and image-directory justfiles. */
export function registerProjectCommands(program: Command) {
  const project = program.command('project').description('Run local image actions through Make and the repository Docker configuration');
  for (const action of ['build', 'load', 'push', 'print', 'info'] as const satisfies readonly ProjectAction[]) {
    project.command(action)
      .description(`${action} an image group using its Makefile or shared build.mk`)
      .argument('<directory>', 'image directory, relative to the repository root or absolute')
      .argument('[targets...]', 'Bake target names; omit for the default group')
      .option('--dry-run', 'print Make commands without executing their recipes')
      .action(async (directory: string, targets: string[], options: { dryRun?: boolean }) => {
        await runProject(root, directory, action, targets, options);
      });
  }
}
