# Image templates

## NodeJS

1. best to build on host, then copy to container
   - static site
   - bundle the deps
   - nextjs standalone
2. copy package.json & lock to container first, then install deps
   - dynamic site
   - need node_modules
