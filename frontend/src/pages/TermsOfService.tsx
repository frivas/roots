import TranslatedText from '../components/TranslatedText';

const TermsOfService = () => (
  <main className="mx-auto max-w-3xl space-y-6 px-6 py-12 text-foreground">
    <h1 className="text-3xl font-bold"><TranslatedText>Terms of Service</TranslatedText></h1>
    <p className="text-muted-foreground">
      <TranslatedText>Raíces is currently a demonstration. Sample records are fictional and changes are not saved.</TranslatedText>
    </p>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold"><TranslatedText>Acceptable use</TranslatedText></h2>
      <p><TranslatedText>Use the service only for lawful educational evaluation. Do not enter real student or family information.</TranslatedText></p>
    </section>
    <section className="space-y-2">
      <h2 className="text-xl font-semibold"><TranslatedText>AI services</TranslatedText></h2>
      <p><TranslatedText>AI-generated content may contain inaccuracies. Verify important information with a teacher or school.</TranslatedText></p>
    </section>
  </main>
);

export default TermsOfService;
