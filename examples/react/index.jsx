const App = () => {
  const description = t('description');

  return (
    <div>
      <h1>{t('title')}</h1>
      <div>{description}</div>
    </div>
  );
};

export default App;
