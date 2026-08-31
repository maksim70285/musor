const fs = require('fs');

function memoizeComponent(file, componentName) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    new RegExp(`export function ${componentName}\\s*\\(([^)]+)\\)\\s*{`),
    `export const ${componentName} = React.memo(function ${componentName}($1) {`
  );
  // Add closing parenthesis to the end of the file or before EOF/exports
  // But wait, the function might be closed by `}`. Let's do it smarter.
  // Actually, standard `export const Component = React.memo(({ props }) => { ... })` is easier to just replace.
  // Let's use a simple regex replacement for the whole function if possible, but that's risky.
}
