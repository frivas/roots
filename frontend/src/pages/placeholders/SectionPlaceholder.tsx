import React from 'react';
import { Construction } from 'lucide-react';
import TranslatedText from '../../components/TranslatedText';
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';

interface SectionPlaceholderProps {
  title: string;
  description?: string;
}

const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({
  title,
  description = 'This section is not available in the demo yet.',
}) => (
  <div className="container mx-auto max-w-4xl p-6">
    <h1 className="mb-6 text-3xl font-bold text-foreground">
      <TranslatedText>{title}</TranslatedText>
    </h1>
    <Card className="border-border">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <Construction className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">
          <TranslatedText>Page Under Development</TranslatedText>
        </CardTitle>
        <CardDescription>
          <TranslatedText>{description}</TranslatedText>
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
);

export default SectionPlaceholder;
