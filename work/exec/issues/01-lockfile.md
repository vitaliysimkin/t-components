# package-lock.json не синхронізований з package.json
`npm ci` падає. CI використовує `npm install`, тож реліз не блокує. Оновити lock у кроці 10.
