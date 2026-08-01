function JobList({
  jobs,
  selectedJobId,
  postingText,
  applicationType,
  onSelect,
  onPostingChange,
  onApplicationTypeChange,
}) {
  return (
    <section className="card job-list-card branded-form-card">
      <div className="section-heading branded-section-heading">
        <div>
          <h2>İlan ve Başvuru Modu</h2>
          <p>İlan metnini yapıştır, modu seç veya hazır örneklerden birini kullan.</p>
        </div>
        <img
          className="form-card-bunny form-card-bunny-job"
          src="/brand/leopara-form-bunny.png"
          alt=""
          width="88"
          height="129"
          aria-hidden="true"
          draggable={false}
        />
      </div>

      <div className="mode-toggle" aria-label="Başvuru modu">
        <button
          className={applicationType === "job" ? "is-active" : ""}
          type="button"
          onClick={() => onApplicationTypeChange("job")}
        >
          İş Başvurusu
        </button>
        <button
          className={applicationType === "internship" ? "is-active" : ""}
          type="button"
          onClick={() => onApplicationTypeChange("internship")}
        >
          Staj Başvurusu
        </button>
      </div>

      <textarea
        className="textarea posting-textarea"
        value={postingText}
        onChange={(event) => onPostingChange(event.target.value)}
        placeholder="İş veya staj ilanı metnini buraya yapıştır..."
      />

      <div className="job-list-scroll">
        <div className="job-list">
          {jobs.map((job) => (
            <article
              key={job.id}
              className={`job-card ${selectedJobId === job.id ? "is-selected" : ""}`}
              onClick={() => onSelect(job)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(job);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <h3>{job.title}</h3>
              <div className="card-meta">
                <span>{job.company}</span>
                <span>{job.location}</span>
                <span>{job.workType}</span>
              </div>
              <div className="tag-list">
                {job.requiredSkills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="selection-note">
        {selectedJobId
          ? "Seçili örnek ilanın metni analiz alanına aktarıldı."
          : "Hazır örnek seçmeden kendi ilan metninle analiz yapabilirsin."}
      </div>
    </section>
  );
}

export default JobList;
