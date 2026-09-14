import TranslatedText from '../components/TranslatedText';

const CookiePolicy = () => (
  <main className="mx-auto max-w-3xl space-y-6 px-6 py-12 text-foreground">
    <h1 className="text-3xl font-bold"><TranslatedText>Cookie Policy</TranslatedText></h1>
    <p className="text-muted-foreground">
      <TranslatedText>Raíces uses essential browser storage to keep authentication and language preferences working.</TranslatedText>
    </p>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold"><TranslatedText>Essential storage</TranslatedText></h2>
      <p><TranslatedText>Authentication providers may store session information. Raíces stores your selected language in this browser.</TranslatedText></p>
    </section>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold"><TranslatedText>Your choices</TranslatedText></h2>
      <p><TranslatedText>You can clear browser storage in your browser settings. Doing so may sign you out and reset your language.</TranslatedText></p>
    </section>
  </main>
);

export default CookiePolicy;
