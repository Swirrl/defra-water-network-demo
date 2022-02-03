import './Search.css';

function Search() {
  const onSubmit = e => {
    e.preventDefault();
    console.log("Submitting search...", e)
  }

  return (
    <form action="/"
          method="get"
          className="Search-container"
          autoComplete="off"
          onSubmit={onSubmit}>
      <label htmlFor="header-search">
        <span className="visually-hidden">Search for a place</span>
      </label>
      <input
        type="text"
        id="header-search"
        placeholder="Search for a place"
        name="s"
        className="Search-input"
      />
      <button type="submit" className="Search-submit-button">Search</button>
    </form>
  );
}

export default Search;
