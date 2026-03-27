import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ConfigPage.css";

export interface Config {
  METABASE_INSTANCE_URL: string;
  METABASE_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  ZHIPU_API_KEY: string;
  selectedModel: string;
}

const DEFAULT_CONFIG: Config = {
  METABASE_INSTANCE_URL: "",
  METABASE_API_KEY: "",
  ANTHROPIC_API_KEY: "",
  ZHIPU_API_KEY: "",
  selectedModel: "claude-sonnet-4-20250514",
};

interface ConfigPageProps {
  onConfigSaved?: () => void;
}

export default function ConfigPage({ onConfigSaved }: ConfigPageProps) {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (Object.keys(data).length > 0) {
          setConfig((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (field: keyof Config) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setConfig((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setMessageType("success");
        setMessage("✓ Configuration saved! Redirecting...");
        onConfigSaved?.(); // Refresh config status in parent
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessageType("error");
        setMessage("✗ Failed to save configuration");
      }
    } catch {
      setMessageType("error");
      setMessage("✗ Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="config-page">
      <header className="config-header">
        <h1>Configuration</h1>
        <p>Configure your API keys and model settings</p>
      </header>

      <form className="config-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Metabase Settings <span className="required-section">(Required)</span></h2>
          <div className="form-field">
            <label htmlFor="METABASE_INSTANCE_URL">Metabase Instance URL <span className="required">*</span></label>
            <input
              id="METABASE_INSTANCE_URL"
              type="url"
              value={config.METABASE_INSTANCE_URL}
              onChange={handleChange("METABASE_INSTANCE_URL")}
              placeholder="https://your-metabase.com"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="METABASE_API_KEY">Metabase API Key <span className="required">*</span></label>
            <input
              id="METABASE_API_KEY"
              type="password"
              value={config.METABASE_API_KEY}
              onChange={handleChange("METABASE_API_KEY")}
              placeholder="mb_..."
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>AI Provider Settings <span className="required-section">(At least one required)</span></h2>
          <div className="form-field">
            <label htmlFor="ANTHROPIC_API_KEY">Anthropic API Key</label>
            <input
              id="ANTHROPIC_API_KEY"
              type="password"
              value={config.ANTHROPIC_API_KEY}
              onChange={handleChange("ANTHROPIC_API_KEY")}
              placeholder="sk-ant-..."
            />
          </div>
          <div className="form-field">
            <label htmlFor="ZHIPU_API_KEY">Zhipu API Key</label>
            <input
              id="ZHIPU_API_KEY"
              type="password"
              value={config.ZHIPU_API_KEY}
              onChange={handleChange("ZHIPU_API_KEY")}
              placeholder="Your Zhipu API key"
            />
          </div>
          <div className="form-field">
            <label htmlFor="selectedModel">Default Model</label>
            <input
              id="selectedModel"
              type="text"
              value={config.selectedModel}
              onChange={handleChange("selectedModel")}
              placeholder="claude-sonnet-4-20250514"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate("/")} disabled={loading}>
            Cancel
          </button>
        </div>

        {message && (
          <div className={`form-message ${messageType}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
