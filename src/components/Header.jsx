function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <img
            className="brand-mark"
            src="/brand/leopara-logo-round.png"
            alt=""
            width="40"
            height="40"
            draggable={false}
          />
          <div className="brand-copy">
            <strong>LEOPARA</strong>
            <span>Akıllı CV Eşleştirme</span>
          </div>
        </div>

        <nav className="site-nav">
          <a className="nav-link" href="#anasayfa">
            Ana Sayfa
          </a>
          <a className="nav-link" href="#ozellikler">
            Özellikler
          </a>
          <a className="nav-link" href="#eslestirme">
            Eşleştirme
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
