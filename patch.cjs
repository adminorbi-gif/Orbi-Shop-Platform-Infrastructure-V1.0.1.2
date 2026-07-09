const fs = require('fs');
let code = fs.readFileSync('src/pages/ClientApp/index.tsx', 'utf8');

const target = "{/* What are you looking for automated recommendation bar */}";
const replacement = `<ClientSmartBundles products={products} lang={lang} onSelectProduct={(p) => handleProductSelect(p)} />

                    {/* What are you looking for automated recommendation bar */}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/ClientApp/index.tsx', code);
