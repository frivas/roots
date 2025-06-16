import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Shield, ExternalLink } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <motion.div 
      className="container max-w-4xl py-8 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <Shield className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-arial-black font-bold text-foreground">
            Política de Privacidad
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                          Información sobre el tratamiento de datos personales en el proyecto Raíces de la Comunidad de Madrid
        </p>
      </motion.div>

      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle className="font-arial-black text-xl">Responsable del Tratamiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Entidad:</strong> Comunidad de Madrid</p>
            <p><strong>Consejería:</strong> Educación, Ciencia y Universidades</p>
            <p><strong>Dirección:</strong> Calle Alcalá, 32 - 28014 Madrid</p>
            <p><strong>Contacto:</strong> educacion@madrid.org</p>
            <p><strong>Teléfono:</strong> +34 91 720 1000</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle className="font-arial-black text-xl">Finalidad del Tratamiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
                            Los datos personales recogidos a través de la plataforma Raíces se utilizarán para las siguientes finalidades:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Gestión de servicios educativos y programas de formación</li>
            <li>Comunicación con usuarios sobre actividades y servicios</li>
            <li>Envío de notificaciones y alertas del sistema</li>
            <li>Mejora de la calidad de los servicios prestados</li>
            <li>Cumplimiento de obligaciones legales</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle className="font-arial-black text-xl">Base Jurídica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            El tratamiento de sus datos personales se basa en:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Ejercicio de poderes públicos:</strong> Prestación de servicios públicos educativos</li>
            <li><strong>Consentimiento:</strong> Para comunicaciones no esenciales y servicios adicionales</li>
            <li><strong>Cumplimiento de obligaciones legales:</strong> Normativa educativa aplicable</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle className="font-arial-black text-xl">Derechos de los Interesados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            De conformidad con el RGPD, usted tiene derecho a:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Acceso:</strong> Obtener información sobre el tratamiento de sus datos</li>
            <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
            <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
            <li><strong>Limitación:</strong> Restringir el tratamiento en determinadas circunstancias</li>
            <li><strong>Oposición:</strong> Oponerse al tratamiento por motivos relacionados con su situación particular</li>
            <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Para ejercer estos derechos, puede contactar con nosotros en: educacion@madrid.org
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle className="font-arial-black text-xl">Conservación de Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Los datos personales se conservarán durante el tiempo necesario para cumplir con las finalidades 
            para las que fueron recogidos y, en su caso, para cumplir con las obligaciones legales aplicables.
          </p>
          <p className="text-muted-foreground">
            Una vez finalizada la relación, los datos se conservarán bloqueados durante los plazos de prescripción 
            de las posibles responsabilidades derivadas del tratamiento.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle className="font-arial-black text-xl">Seguridad de los Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            La Comunidad de Madrid ha adoptado las medidas técnicas y organizativas necesarias para garantizar 
            la seguridad de los datos personales y evitar su alteración, pérdida, tratamiento o acceso no autorizado.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle className="font-arial-black text-xl">Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Para información más detallada sobre el tratamiento de datos personales en la Comunidad de Madrid, 
            puede consultar:
          </p>
          <a 
            href="https://www.comunidad.madrid/protecciondedatos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Portal de Protección de Datos de la Comunidad de Madrid
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Aviso RGPD:</p>
            <p>
              Los datos personales recogidos de su correo electrónico serán tratados de conformidad con el 
              Reglamento Europeo (UE) 2016/679 de Protección de Datos Personales (RGPD) y la Ley Orgánica 3/2018, 
              de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales. 
              La información relativa al responsable del tratamiento y la finalidad, así como cualquier información 
              adicional relativa a la protección de sus datos personales podrá consultarla en el siguiente enlace: 
              www.comunidad.madrid/protecciondedatos. Ante el responsable del tratamiento podrá ejercer, entre otros, 
              sus derechos de acceso, rectificación, supresión, oposición y limitación del tratamiento.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        <p className="mt-2">© {new Date().getFullYear()} Comunidad de Madrid</p>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy; 