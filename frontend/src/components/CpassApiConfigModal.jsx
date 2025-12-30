import React, { useState, useEffect } from 'react';
import './CpassApiConfigModal.css';

const CpassApiConfigModal = ({ isOpen, onClose, onSave }) => {
  const [ccSpecialKey, setCcSpecialKey] = useState('');
  const [codexKey, setCodexKey] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('cc_special');

  useEffect(() => {
    if (isOpen) {
      // 从 localStorage 加载已保存的密钥
      const savedCcSpecialKey = localStorage.getItem('cpass_cc_special_key') || '';
      const savedCodexKey = localStorage.getItem('cpass_codex_key') || '';
      setCcSpecialKey(savedCcSpecialKey);
      setCodexKey(savedCodexKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    // 保存密钥到 localStorage
    if (ccSpecialKey.trim()) {
      localStorage.setItem('cpass_cc_special_key', ccSpecialKey.trim());
    }
    if (codexKey.trim()) {
      localStorage.setItem('cpass_codex_key', codexKey.trim());
    }

    // 保存当前选择的分组
    localStorage.setItem('cpass_selected_group', selectedGroup);

    onSave({
      ccSpecialKey: ccSpecialKey.trim(),
      codexKey: codexKey.trim(),
      selectedGroup
    });

    onClose();
  };

  const handleClear = (group) => {
    if (group === 'cc_special') {
      setCcSpecialKey('');
      localStorage.removeItem('cpass_cc_special_key');
    } else {
      setCodexKey('');
      localStorage.removeItem('cpass_codex_key');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cpass-modal-overlay" onClick={onClose}>
      <div className="cpass-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cpass-modal-header">
          <h2>🔑 Cpass.cc API 密钥配置</h2>
          <button className="cpass-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cpass-modal-body">
          <div className="cpass-info-section">
            <p className="cpass-info-text">
              配置 <strong>cpass.cc</strong> 中转站密钥，支持高质量AI模型
            </p>
            <div className="cpass-api-info">
              <p><strong>API地址：</strong>https://api.cpass.cc</p>
            </div>
          </div>

          {/* CC Special 分组 */}
          <div className="cpass-key-section">
            <div className="cpass-section-header">
              <h3>🎯 CC 特价分组 (cc_special)</h3>
              <span className="cpass-badge">无缓存</span>
            </div>
            <p className="cpass-section-desc">
              支持模型：claude-opus-4-5-20251101
            </p>
            <div className="cpass-input-group">
              <input
                type="password"
                value={ccSpecialKey}
                onChange={(e) => setCcSpecialKey(e.target.value)}
                placeholder="请输入 CC 特价分组密钥"
                className="cpass-input"
              />
              <button
                className="cpass-clear-btn"
                onClick={() => handleClear('cc_special')}
                title="清除密钥"
              >
                清除
              </button>
            </div>
          </div>

          {/* Codex 分组 */}
          <div className="cpass-key-section">
            <div className="cpass-section-header">
              <h3>📚 Codex 专用分组 (codex)</h3>
              <span className="cpass-badge codex">深度分析</span>
            </div>
            <p className="cpass-section-desc">
              支持模型：gpt-5.1-thinking、gpt-5.2 - 适合写文档和深度分析项目
            </p>
            <div className="cpass-input-group">
              <input
                type="password"
                value={codexKey}
                onChange={(e) => setCodexKey(e.target.value)}
                placeholder="请输入 Codex 专用分组密钥"
                className="cpass-input"
              />
              <button
                className="cpass-clear-btn"
                onClick={() => handleClear('codex')}
                title="清除密钥"
              >
                清除
              </button>
            </div>
          </div>

          {/* 默认使用的分组 */}
          <div className="cpass-key-section">
            <h3>⚙️ 默认使用分组</h3>
            <div className="cpass-radio-group">
              <label className="cpass-radio-label">
                <input
                  type="radio"
                  value="cc_special"
                  checked={selectedGroup === 'cc_special'}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                />
                <span>CC 特价分组</span>
              </label>
              <label className="cpass-radio-label">
                <input
                  type="radio"
                  value="codex"
                  checked={selectedGroup === 'codex'}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                />
                <span>Codex 专用分组</span>
              </label>
            </div>
          </div>

          <div className="cpass-warning-section">
            <p>⚠️ 密钥仅保存在浏览器本地，不会上传到服务器</p>
            <p>💡 两个分组的密钥不同，请分别配置</p>
          </div>
        </div>

        <div className="cpass-modal-footer">
          <button className="cpass-btn cpass-btn-cancel" onClick={onClose}>
            取消
          </button>
          <button
            className="cpass-btn cpass-btn-save"
            onClick={handleSave}
            disabled={!ccSpecialKey.trim() && !codexKey.trim()}
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default CpassApiConfigModal;
