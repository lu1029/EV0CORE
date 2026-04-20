/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const LOGO_URL =
  'https://csikbgwayqhgnuveidaz.supabase.co/storage/v1/object/public/email-assets/evocore-logo.png'

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu e-mail para começar no EvoCore</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoWrap}>
          <Img src={LOGO_URL} alt="EvoCore" width="56" height="56" style={logo} />
        </Section>
        <Heading style={h1}>Bem-vindo ao EvoCore 💪</Heading>
        <Text style={text}>
          Estamos quase lá! Confirme o e-mail{' '}
          <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>{' '}
          para liberar seus treinos personalizados, corridas e plano nutricional.
        </Text>
        <Section style={btnWrap}>
          <Button style={button} href={confirmationUrl}>Confirmar meu e-mail</Button>
        </Section>
        <Text style={small}>
          Ou cole este link no navegador:<br />
          <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
        </Text>
        <Text style={footer}>
          Se você não criou uma conta no{' '}
          <Link href={siteUrl} style={link}>{siteName}</Link>, pode ignorar este e-mail.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const logoWrap = { marginBottom: '24px' }
const logo = { borderRadius: '12px', display: 'block' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: 'hsl(0, 0%, 10%)', margin: '0 0 16px', letterSpacing: '-0.02em' }
const text = { fontSize: '15px', color: 'hsl(0, 0%, 30%)', lineHeight: '1.6', margin: '0 0 24px' }
const small = { fontSize: '12px', color: 'hsl(0, 0%, 45%)', lineHeight: '1.5', margin: '24px 0 0', wordBreak: 'break-all' as const }
const link = { color: 'hsl(142, 100%, 32%)', textDecoration: 'underline' }
const btnWrap = { margin: '8px 0' }
const button = { backgroundColor: 'hsl(142, 100%, 39%)', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '14px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: 'hsl(0, 0%, 55%)', margin: '32px 0 0', lineHeight: '1.5' }
