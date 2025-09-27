function copyPopup(text) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.2)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;

    // 创建弹窗容器
    const popup = document.createElement('div');
    popup.style.background = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    popup.style.textAlign = 'center';
    popup.innerHTML = `
      <input type="text" id="copyInput" style="width: 500px; padding: 8px;" readonly />
      <div style="margin-top: 10px;">
        <button id="copyBtn">Copy</button>
        <button id="closeBtn">Close</button>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // 自动选中文本
    const input = popup.querySelector('#copyInput');
    input.value = text;
    input.select();

    // 复制按钮事件
    popup.querySelector('#copyBtn').onclick = function () {
        input.select();
        input.setSelectionRange(0, 999999); // 兼容移动端
        document.execCommand('copy');
        document.body.removeChild(overlay);
    };

    // 关闭按钮事件
    popup.querySelector('#closeBtn').onclick = function () {
        document.body.removeChild(overlay);
    };
}


const Cookie = {
  /**
   * 设置 Cookie
   * @param {string} name - 键名
   * @param {any} value - 值（支持对象/数组）
   * @param {number} days - 有效期（单位：天）
   */
  set(name, value, days = 7) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    const jsonValue = encodeURIComponent(JSON.stringify(value));
    document.cookie = `${name}=${jsonValue}; ${expires}; path=/`;
  },

  /**
   * 获取 Cookie
   * @param {string} name - 键名
   * @returns {any} - 返回值（自动解析 JSON）
   */
  get(name) {
    const cookies = document.cookie.split("; ");
    for (let c of cookies) {
      const [key, val] = c.split("=");
      if (key === name) {
        try {
          return JSON.parse(decodeURIComponent(val));
        } catch (e) {
          return val; // 不是 JSON 则返回原始值
        }
      }
    }
    return null;
  },

  /**
   * 删除 Cookie
   * @param {string} name - 键名
   */
  remove(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
};
