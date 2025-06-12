import ReactRouterAuth from "@auth/react-router"
import Apple from "@auth/react-router/providers/apple"
import Auth0 from "@auth/react-router/providers/auth0"
import AzureB2C from "@auth/react-router/providers/azure-ad-b2c"
import BoxyHQSAML from "@auth/react-router/providers/boxyhq-saml"
import Cognito from "@auth/react-router/providers/cognito"
import Coinbase from "@auth/react-router/providers/coinbase"
import Discord from "@auth/react-router/providers/discord"
import Dropbox from "@auth/react-router/providers/dropbox"
import Facebook from "@auth/react-router/providers/facebook"
import GitHub from "@auth/react-router/providers/github"
import GitLab from "@auth/react-router/providers/gitlab"
import Google from "@auth/react-router/providers/google"
import Hubspot from "@auth/react-router/providers/hubspot"
import Keycloak from "@auth/react-router/providers/keycloak"
import LinkedIn from "@auth/react-router/providers/linkedin"
import Netlify from "@auth/react-router/providers/netlify"
import Okta from "@auth/react-router/providers/okta"
import Passage from "@auth/react-router/providers/passage"
import Pinterest from "@auth/react-router/providers/pinterest"
import Reddit from "@auth/react-router/providers/reddit"
import Slack from "@auth/react-router/providers/slack"
import Spotify from "@auth/react-router/providers/spotify"
import Twitch from "@auth/react-router/providers/twitch"
import Twitter from "@auth/react-router/providers/twitter"
import WorkOS from "@auth/react-router/providers/workos"
import Zoom from "@auth/react-router/providers/zoom"

export const { auth, handlers, signIn, signOut } = ReactRouterAuth({
  providers: [
    Apple,
    Auth0,
    AzureB2C({
      clientId: process.env.AUTH_AZURE_AD_B2C_ID,
      clientSecret: process.env.AUTH_AZURE_AD_B2C_SECRET,
      issuer: process.env.AUTH_AZURE_AD_B2C_ISSUER,
    }),
    BoxyHQSAML({
      clientId: "dummy",
      clientSecret: "dummy",
      issuer: process.env.AUTH_BOXYHQ_SAML_ISSUER,
    }),
    Cognito,
    Coinbase,
    Discord,
    Dropbox,
    Facebook,
    GitHub,
    GitLab,
    Google,
    Hubspot,
    Keycloak,
    LinkedIn,
    Netlify,
    Okta,
    Passage,
    Pinterest,
    Reddit,
    Slack,
    Spotify,
    Twitch,
    Twitter,
    WorkOS({
      connection: process.env.AUTH_WORKOS_CONNECTION!,
    }),
    Zoom,
  ],
})
