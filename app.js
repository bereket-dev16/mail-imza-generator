const employeeList = document.querySelector("#employeeList");
const employeeSearch = document.querySelector("#employeeSearch");
const employeeCount = document.querySelector("#employeeCount");
const signaturePreview = document.querySelector("#signaturePreview");
const copyButton = document.querySelector("#copyButton");
const toast = document.querySelector("#toast");

const SIGNATURE_FONT = "'Gilroy','Gilroy-Medium','Gilroy-Light',Arial,Helvetica,sans-serif";

let selectedEmployee = null;
let toastTimer = null;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeUrl(url = "") {
  const trimmedUrl = String(url).trim();

  if (!trimmedUrl) {
    return "";
  }

  if (trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  return "";
}

function normalizeImageUrl(url = "") {
  const imageUrl = normalizeUrl(url);
  const lowerUrl = imageUrl.toLowerCase();

  if (!imageUrl) {
    return "";
  }

  if (
    lowerUrl.includes("localhost") ||
    lowerUrl.includes("127.0.0.1") ||
    lowerUrl.startsWith("file:") ||
    lowerUrl.startsWith("data:") ||
    lowerUrl.startsWith("blob:") ||
    lowerUrl.includes("figma.com") ||
    lowerUrl.endsWith(".svg")
  ) {
    return "";
  }

  return imageUrl;
}

function normalizeTel(phone = "") {
  const rawPhone = String(phone).trim();

  if (!rawPhone || /[a-z]/i.test(rawPhone)) {
    return "";
  }

  const digits = rawPhone.replace(/\D/g, "");

  if (digits.length < 7) {
    return "";
  }

  return `tel:${rawPhone.startsWith("+") ? "+" : ""}${digits}`;
}

function hasProfileImage(employee) {
  return Boolean(employee.showProfileImage && normalizeImageUrl(employee.profileImage));
}

function getLocalSignatureAssetUrl(fileName) {
  return `assets/imza-items/${fileName}`;
}

function getEmailSignatureImageUrl(url = "") {
  return normalizeImageUrl(url);
}

function getWebsiteLabel(url = "") {
  return String(url).replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getPhoneLine(employee) {
  return [employee.phone, employee.mobile].filter(Boolean).join(" | ");
}

function getPrimaryPhoneHref(employee) {
  return normalizeTel(employee.mobile) || normalizeTel(employee.phone);
}

function buildIconRow(iconUrl, iconWidth, iconHeight, value, href, options = {}) {
  if (!value) {
    return "";
  }

  const safeIconUrl = options.allowLocalImage ? String(iconUrl || "").trim() : normalizeImageUrl(iconUrl);
  const safeValue = escapeHtml(value);
  const safeHref = href ? escapeHtml(href) : "";
  const lineHeight = options.lineHeight || "17px";
  const paddingBottom = options.paddingBottom || "8px";
  const textSize = options.textSize || "11px";
  const iconAlt = options.iconAlt || "";
  const content = safeHref
    ? `<a href="${safeHref}" style="color:#1e1e1e;text-decoration:none;">${safeValue}</a>`
    : safeValue;

  return `
    <tr>
      <td style="width:23px;padding:0 8px ${paddingBottom} 0;vertical-align:top;">
        ${safeIconUrl ? `<img src="${escapeHtml(safeIconUrl)}" width="${iconWidth}" height="${iconHeight}" alt="${escapeHtml(iconAlt)}" style="display:block;width:${iconWidth}px;height:${iconHeight}px;border:0;outline:none;text-decoration:none;">` : ""}
      </td>
      <td style="padding:0 0 ${paddingBottom} 0;font-family:${SIGNATURE_FONT};font-size:${textSize};font-weight:300;line-height:${lineHeight};color:#1e1e1e;vertical-align:top;">${content}</td>
    </tr>`;
}

function generateSignature(employee, options = {}) {
  const isPreview = options.preview === true;
  const logoUrl = isPreview ? getLocalSignatureAssetUrl("sirket-logo.png") : getEmailSignatureImageUrl(COMPANY.logoUrl);
  const smallMarkUrl = isPreview ? getLocalSignatureAssetUrl("sirket-ikon.png") : getEmailSignatureImageUrl(COMPANY.companyIconUrl || COMPANY.logoUrl);
  const phoneIconUrl = isPreview ? getLocalSignatureAssetUrl("phone-ikon.png") : getEmailSignatureImageUrl(COMPANY.phoneIconUrl);
  const locationIconUrl = isPreview ? getLocalSignatureAssetUrl("lokasyon-ikon.png") : getEmailSignatureImageUrl(COMPANY.locationIconUrl);
  const websiteIconUrl = isPreview ? getLocalSignatureAssetUrl("url-ikon.png") : getEmailSignatureImageUrl(COMPANY.webIconUrl);
  const linkedinIconUrl = isPreview ? getLocalSignatureAssetUrl("url-ikon.png") : getEmailSignatureImageUrl(COMPANY.linkedinIconUrl);
  const handlerIconUrl = isPreview ? getLocalSignatureAssetUrl("handler-ikon.png") : getEmailSignatureImageUrl(COMPANY.catalogIconUrl);
  const websiteUrl = normalizeUrl(COMPANY.website);
  const catalogUrl = normalizeUrl(COMPANY.catalogUrl || COMPANY.website);
  const phoneLine = getPhoneLine(employee);
  const phoneHref = getPrimaryPhoneHref(employee);
  const linkedinUrl = normalizeUrl(employee.linkedin);
  const showProfile = hasProfileImage(employee);
  const identityVisualCell = showProfile
    ? `
      <td style="width:46px;padding:0 12px 0 0;vertical-align:middle;">
        <img src="${escapeHtml(normalizeImageUrl(employee.profileImage))}" width="38" height="38" alt="${escapeHtml(employee.name)} profil fotoğrafı" style="display:block;width:38px;height:38px;border:0;outline:none;text-decoration:none;border-radius:19px;">
      </td>`
    : `
      <td style="width:46px;padding:0 12px 0 0;vertical-align:middle;">
        ${smallMarkUrl ? `<img src="${escapeHtml(smallMarkUrl)}" width="34" height="32" alt="${escapeHtml(COMPANY.name)} ikon" style="display:block;width:34px;height:32px;border:0;outline:none;text-decoration:none;">` : ""}
      </td>`;
  const departmentLine = employee.department
    ? `<div style="margin-top:0;font-family:${SIGNATURE_FONT};font-size:10px;font-weight:300;font-style:italic;line-height:13px;color:#1e1e1e;">${escapeHtml(employee.department)}</div>`
    : "";
  const linkedinLine = linkedinUrl
    ? buildIconRow(linkedinIconUrl, 11, 11, "LinkedIn", linkedinUrl, { iconAlt: "LinkedIn", paddingBottom: "0", allowLocalImage: isPreview })
    : "";

  return `
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;font-family:${SIGNATURE_FONT};color:#1e1e1e;">
  <tr>
    <td style="padding:24px 20px 22px 22px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;border-collapse:collapse;font-family:${SIGNATURE_FONT};">
        <tr>
          <td style="width:276px;vertical-align:top;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;font-family:${SIGNATURE_FONT};">
              <tr>
                ${identityVisualCell}
                <td style="width:1px;padding:0;background:#9a9a9a;font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding:0 0 0 12px;vertical-align:middle;">
                  <div style="font-family:${SIGNATURE_FONT};font-size:20px;font-weight:500;line-height:22px;color:#000000;white-space:nowrap;">${escapeHtml(employee.name)}</div>
                  <div style="margin-top:1px;font-family:${SIGNATURE_FONT};font-size:12px;font-weight:500;line-height:15px;color:#000000;">${escapeHtml(employee.title)}</div>
                  ${departmentLine}
                </td>
              </tr>
            </table>

            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-top:18px;border-collapse:collapse;font-family:${SIGNATURE_FONT};">
              ${buildIconRow(phoneIconUrl, 14, 14, phoneLine, phoneHref, { iconAlt: "Telefon", allowLocalImage: isPreview })}
              ${buildIconRow(locationIconUrl, 11, 18, COMPANY.address, "", { iconAlt: "Adres", lineHeight: "15px", allowLocalImage: isPreview })}
              ${buildIconRow(websiteIconUrl, 14, 14, getWebsiteLabel(COMPANY.website), websiteUrl, { iconAlt: "Web sitesi", paddingBottom: "0", allowLocalImage: isPreview })}
              ${linkedinLine}
            </table>

            <div style="margin-top:18px;font-family:${SIGNATURE_FONT};font-size:11px;font-weight:300;line-height:15px;color:#1e1e1e;">
              Kataloğumuzu incelemek için ${catalogUrl ? `<a href="${escapeHtml(catalogUrl)}" style="color:${COMPANY.colors.orange};text-decoration:none;">tıklayınız.</a>` : `<span style="color:${COMPANY.colors.orange};">tıklayınız.</span>`}
            </div>
          </td>
          <td style="width:20px;font-size:0;line-height:0;">&nbsp;</td>
          <td style="width:262px;padding:36px 0 0 0;vertical-align:top;text-align:right;">
            ${websiteUrl ? `<a href="${escapeHtml(websiteUrl)}" style="text-decoration:none;">` : ""}
              ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" width="258" height="92" alt="${escapeHtml(COMPANY.name)} logosu" style="display:block;width:258px;height:92px;border:0;outline:none;text-decoration:none;margin:0 0 0 auto;">` : ""}
            ${websiteUrl ? "</a>" : ""}
            ${catalogUrl ? `<a href="${escapeHtml(catalogUrl)}" style="display:inline-block;text-decoration:none;margin-top:14px;">` : `<span style="display:inline-block;margin-top:14px;">`}
              ${handlerIconUrl ? `<img src="${escapeHtml(handlerIconUrl)}" width="16" height="19" alt="Katalog bağlantısı" style="display:block;width:16px;height:19px;border:0;outline:none;text-decoration:none;">` : ""}
            ${catalogUrl ? "</a>" : "</span>"}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
}

function generatePlainTextSignature(employee) {
  const lines = [
    employee.name,
    employee.title,
    employee.department,
    employee.phone && `T: ${employee.phone}`,
    employee.mobile && `M: ${employee.mobile}`,
    `W: ${COMPANY.website}`,
    `A: ${COMPANY.address}`,
    employee.linkedin && `LinkedIn: ${employee.linkedin}`,
    COMPANY.name
  ];

  return lines.filter(Boolean).join("\n");
}

function getEmployeeSearchText(employee) {
  return [
    employee.name,
    employee.title,
    employee.department,
    employee.email,
    employee.phone,
    employee.mobile
  ].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");
}

function renderEmployees(query = "") {
  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
  const visibleEmployees = normalizedQuery
    ? employees.filter((employee) => getEmployeeSearchText(employee).includes(normalizedQuery))
    : employees;

  employeeList.innerHTML = "";
  employeeCount.textContent = `${visibleEmployees.length} kişi`;

  if (visibleEmployees.length === 0) {
    const emptyResult = document.createElement("div");
    emptyResult.className = "list-empty";
    emptyResult.textContent = "Bu arama ile eşleşen çalışan bulunamadı.";
    employeeList.append(emptyResult);
    return;
  }

  visibleEmployees.forEach((employee) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "employee-button";
    button.dataset.employeeId = employee.id;
    button.setAttribute("aria-pressed", "false");

    const name = document.createElement("span");
    name.className = "employee-button__name";
    name.textContent = employee.name;

    const meta = document.createElement("span");
    meta.className = "employee-button__meta";
    meta.textContent = [employee.title, employee.department].filter(Boolean).join(" · ");

    button.append(name, meta);
    button.addEventListener("click", () => selectEmployee(employee.id));

    if (selectedEmployee?.id === employee.id) {
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
    }

    employeeList.append(button);
  });
}

function selectEmployee(employeeId) {
  selectedEmployee = employees.find((employee) => employee.id === employeeId) || null;

  document.querySelectorAll(".employee-button").forEach((button) => {
    const isSelected = button.dataset.employeeId === employeeId;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  if (!selectedEmployee) {
    signaturePreview.innerHTML = '<div class="empty-state">Çalışan bulunamadı.</div>';
    copyButton.disabled = true;
    return;
  }

  signaturePreview.innerHTML = generateSignature(selectedEmployee, { preview: true });
  copyButton.disabled = false;
}

async function copySignature() {
  if (!selectedEmployee) {
    return;
  }

  const html = generateSignature(selectedEmployee);
  const plainText = generatePlainTextSignature(selectedEmployee);

  try {
    await copyRichText(html, plainText);
    showToast("İmza kopyalandı. Gmail imza alanına yapıştırabilirsiniz.");
  } catch (error) {
    showToast("Kopyalama başarısız oldu. Lütfen imzayı manuel seçip kopyalayın.", true);
  }
}

async function copyRichText(html, plainText) {
  if (navigator.clipboard && window.ClipboardItem) {
    try {
      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" })
      });

      await navigator.clipboard.write([clipboardItem]);
      return;
    } catch (error) {
      // Some browsers expose ClipboardItem but still reject writes outside HTTPS or strict permission states.
    }
  }

  copyWithExecCommand(html, plainText);
}

function copyWithExecCommand(html, plainText) {
  const clipboardInterceptor = (event) => {
    if (!event.clipboardData) {
      return;
    }

    event.preventDefault();
    event.clipboardData.setData("text/html", html);
    event.clipboardData.setData("text/plain", plainText);
  };

  const tempElement = document.createElement("div");
  tempElement.setAttribute("contenteditable", "true");
  tempElement.style.position = "fixed";
  tempElement.style.left = "-9999px";
  tempElement.style.top = "0";
  tempElement.innerHTML = html;

  document.body.append(tempElement);
  tempElement.focus();
  document.addEventListener("copy", clipboardInterceptor);

  const range = document.createRange();
  range.selectNodeContents(tempElement);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  const copied = document.execCommand("copy");

  selection.removeAllRanges();
  document.removeEventListener("copy", clipboardInterceptor);
  tempElement.remove();

  if (!copied) {
    throw new Error("Copy command failed");
  }
}

function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle("is-error", isError);
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3800);
}

renderEmployees();
employeeSearch.addEventListener("input", (event) => renderEmployees(event.target.value));
copyButton.addEventListener("click", copySignature);
