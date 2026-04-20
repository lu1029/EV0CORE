/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL =
  'https://csikbgwayqhgnuveidaz.supabase.co/storage/v1/object/public/email-assets/evocore-logo.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação EvoCore</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoWrap}>
          <Img src={LOGO_URL} alt="EvoCore" width="56" height="56" style={logo} />
        </Section>
        <Heading style={h1}>Confirme sua identidade</Heading>
        <Text style={text}>
          Use o código abaixo para concluir a verificação na sua conta EvoCore:
        </Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Este código expira em alguns minutos. Se você não solicitou, pode
          ignorar este e-mail com segurança.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const logoWrap = { marginBottom: '24px' }
const logo = { borderRadius: '12px', display: 'block' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: 'hsl(0, 0%, 10%)', margin: '0 0 16px', letterSpacing: '-0.02em' }
const text = { fontSize: '15px', color: 'hsl(0, 0%, 30%)', lineHeight: '1.6', margin: '0 0 24px' }
const codeStyle = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  color: 'hsl(142, 100%, 32%)',
  letterSpacing: '0.3em',
  margin: '0 0 32px',
}
const footer = { fontSize: '12px', color: 'hsl(0, 0%, 55%)', margin: '32px 0 0', lineHeight: '1.5' }
