set minimum-version := '1.58.0'
set lazy
set default-list

# Resolve this import's location independently of the selected justfile or cwd.
_repo_root := parent_directory(source_directory())
