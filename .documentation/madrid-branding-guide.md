# Comunidad de Madrid - UI Look and Feel Guide

## Brand Identity Overview

This document outlines the visual identity and UI guidelines for the Roots website, commissioned by the Comunidad de Madrid.

## Color Palette

### Primary Colors

- **Primary Red**: #ff0000 (RGB: 253,0,0)
  - Pantone: 032
  - CMYK: 0%C 100%M 100%Y 0%K
  - RAL: 3024
  - Usage: Primary accent color, CTAs, highlights

- **Black**: #000000 (RGB: 0,0,0)
  - Pantone: Black
  - CMYK: 0%C 0%M 0%Y 100%K
  - RAL: 5004
  - Usage: Text, outlines, formal elements

- **White**: #ffffff (RGB: 255,255,255)
  - Usage: Background, contrast elements

## Typography

### Font Family
- **Primary**: Arial, Helvetica, sans-serif
- **Secondary**: Arial Black, sans-serif

### Usage Guidelines
- **Headings**: Arial Bold or Arial Black
- **Body Text**: Arial Regular
- **Consejerías**: Arial Regular Uppercase
- **Subbrands**: Follow primary hierarchy

## Logo Guidelines

### Logo Variants
- Positive version (standard)
- Negative version (inverted)

### Usage Rules
- ✅ Always include white outline
- ✅ Minimum width: 40px
- ✅ Include in header (left position)
- ✅ Include in footer (right position)
- ❌ Do not distort the logo
- ❌ Do not recolor the logo

## Layout Principles

The design should embody:
1. **Balance** - Visual equilibrium in all elements
2. **Contrast** - Clear distinction between elements
3. **Order** - Logical information hierarchy
4. **Unity** - Consistent visual language
5. **Homogeneity** - Uniform styling across components
6. **Simplicity** - Clean, uncluttered interfaces

## UI Guidelines

### Background
- Prefer white or light tones
- Maintain sufficient contrast for accessibility

### Text Colors
- Black on white/light backgrounds
- White on dark backgrounds
- Use Madrid red (#ff0000) for accent elements

### Spacing
- Consistent and sufficient whitespace
- Follow standard spacing scales

### Alignment
- Left-aligned for content
- Centered or left-aligned for logos
- Maintain consistent alignment patterns

### Restrictions
- ❌ No gradients allowed
- ✅ Use solid colors only
- ✅ Maintain accessibility standards

## Iconography

### Icon System
- Use AIGA standard pictograms
- Minimal, line-based icons only
- Ensure icons don't conflict with logo design
- Maintain consistency with overall brand

## Footer Requirements

Must include:
- Logo (right position)
- Publishing entity information
- Contact data
- Privacy policy links

## Privacy Notice Templates

### Formula 1 (Informational)
"De conformidad con el Reglamento Europeo (UE) 2016/679 de Protección de Datos Personales (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales, no se guardarán los datos personales que usted nos envía en el correo electrónico al que se contesta con este mail, puesto que el mismo no inicia procedimiento alguno al ser de carácter puramente informativo."

### Formula 2 (Data Collection)
"Los datos personales recogidos de su correo electrónico serán tratados de conformidad con el Reglamento Europeo (UE) 2016/679 de Protección de Datos Personales (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales. La información relativa al responsable del tratamiento y la finalidad, así como cualquier información adicional relativa a la protección de sus datos personales podrá consultarla en el siguiente enlace: www.comunidad.madrid/protecciondedatos. Ante el responsable del tratamiento podrá ejercer, entre otros, sus derechos de acceso, rectificación, supresión, oposición y limitación del tratamiento."

## Implementation Notes

### CSS Custom Properties
```css
:root {
  --madrid-red: #ff0000;
  --madrid-black: #000000;
  --madrid-white: #ffffff;
  --font-primary: Arial, Helvetica, sans-serif;
  --font-secondary: "Arial Black", sans-serif;
}
```

### Component Guidelines
- Use Madrid red sparingly for primary actions and highlights
- Maintain high contrast ratios for accessibility
- Implement consistent spacing using design tokens
- Follow responsive design principles

## Accessibility Requirements

- Ensure color contrast meets WCAG AA standards
- Provide alternative text for all images
- Maintain keyboard navigation support
- Test with screen readers

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Authority: Comunidad de Madrid* 