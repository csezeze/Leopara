function CvInput({
  cvText,
  error,
  isLoading,
  isFileProcessing,
  fileInputKey,
  selectedFileName,
  fileReadSuccess,
  onChange,
  onFileChange,
  onClear,
  onFillSample,
  onMatch,
}) {
  return (
    <section className="card input-card">
      <div className="section-heading">
        <h2>CV Giriş Alanı</h2>
        <p>CV metnini ekle, istersen dosya alanını kullan ve ardından başvuru analizini başlat.</p>
      </div>

      <div className="field-stack">
        <textarea
          className="textarea"
          value={cvText}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Python ile veri analizi projesi geliştirdim. GitHub üzerinde projelerim var..."
        />

        <div className="file-dropzone">
          <strong>CV Dosyası Yükleme</strong>
          <p className="helper-text">
            Kabul edilen formatlar: PDF, DOCX. Uygun dosyalarda metin frontend tarafında okunup textarea alanına aktarılır.
          </p>
          <input
            key={fileInputKey}
            className="file-input"
            type="file"
            accept=".pdf,.docx"
            aria-label="CV dosyası seç"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          />
          {selectedFileName ? (
            <p className="helper-text">
              Seçilen dosya: <strong>{selectedFileName}</strong>
            </p>
          ) : null}
          {isFileProcessing ? (
            <p className="helper-text">Dosya okunuyor, metin hazırlanıyor...</p>
          ) : null}
          {!isFileProcessing && fileReadSuccess ? (
            <p className="file-success-text">✓ Dosya okundu: {selectedFileName}</p>
          ) : null}
        </div>

        {error ? <p className="error-text">{error}</p> : null}
      </div>

      <div className="button-row">
        <button className="button button-secondary" type="button" onClick={onFillSample}>
          Örnek Senaryo Doldur
        </button>
        <button className="button button-tertiary" type="button" onClick={onClear}>
          Temizle
        </button>
        <button
          className="button button-primary"
          type="button"
          onClick={onMatch}
          disabled={isLoading || isFileProcessing}
        >
          {isLoading ? "Analiz ediliyor..." : isFileProcessing ? "Dosya okunuyor..." : "Analiz Et"}
        </button>
      </div>
    </section>
  );
}

export default CvInput;

