export const tableHeader = (val) => {
  return `<th style="vertical-align: top">${val}</th>`;
};

export const tableCell = (val) => {
  return `<td style="vertical-align: top">${val}</td>`;
};

export const toTableCells = (displayProps) => {
  return Object.entries(displayProps)
    .map(([key, value]) => {
      return `<tr>
${tableHeader(key)}
${tableCell(value)}
     </tr>`;
    })
    .join("");
};

export const tableHTML = (title, cellHTML) => {
  const scrollCss = `style="max-height: 20rem;
                            overflow: auto;
                            scrollbar-width: thin;
                            padding-bottom: 5px;"`;
  return `
  <div ${scrollCss}>
    <table style="width: 100%">
      <caption style="font-weight: bold; caption-side: top">${title}</caption>
        ${cellHTML}
    </table>
  </div>`;
};

export const button = (extraAttributes, text) => {
  return `<button class="govuk-button btn-sm mt-3"
                                   style="font-size:0.9rem; margin:0"
                                   ${extraAttributes}
                           >${text}</button>`;
};

export const link = (url, text, style = "") => {
  return `<a target="_blank" style="${style}" href=${url}>${text}</a>`;
};
