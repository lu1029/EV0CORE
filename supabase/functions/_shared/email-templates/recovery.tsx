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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_URL =
  'https://csikbgwayqhgnuveidaz.supabase.co/storage/v1/object/public/email-assets/evocore-logo.png'

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefinição de senha do EvoCore</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoWrap}>
          <Img src={LOGO_URL} alt="EvoCore" width="56" height="56" style={logo} />
        </Section>
        <Heading style={h1}>Redefinir sua senha</Heading>
        <Text style={text}>
          Recebemos um pedido para redefinir a senha da sua conta no {siteName}.
          Clique no botão abaixo para criar uma nova senha.
        </Text>
        <Section style={btnWrap}>
          <Button style={button} href={confirmationUrl}>Criar nova senha</Button>
        </Section>
        <Text style={small}>
          Ou cole este link no navegador:<br />
          <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
        </Text>
        <Text style={footer}>
          Se você não solicitou essa alteração, pode ignorar este e-mail — sua
          senha continuará a mesma.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
