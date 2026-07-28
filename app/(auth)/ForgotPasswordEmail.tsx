'use client'
import React from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function ForgotPassword() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [code, setCode] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [codeSent, setCodeSent] = React.useState(false)

  // Step 1: Send the password reset code to the user's email
  async function sendCode(e: React.FormEvent) {
    e.preventDefault()

    const { error: createError } = await signIn.create({
      identifier: emailAddress,
    })
    if (createError) {
      console.error(JSON.stringify(createError, null, 2))
      return
    }

    const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode()
    if (sendCodeError) {
      console.error(JSON.stringify(sendCodeError, null, 2))
      return
    }

    setCodeSent(true)
  }

  // Step 2: Verify the code provided by the user
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code,
    })
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }
  }

  // Step 3: Submit the new password
  async function submitNewPassword(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      // Optional: sign the user out of all other authenticated sessions
      signOutOfOtherSessions: true,
    })
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }

    if (signIn.status === 'complete') {
      const { error } = await signIn.finalize({
        navigate: async ({ session, decorateUrl }) => {
          // Handle session tasks
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
          if (session?.currentTask) {
            console.log(session.currentTask)
            return
          }

          // If no session tasks, navigate the signed-in user to the home page
          const url = decorateUrl('/')
          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url)
          }
        },
      })

      if (error) {
        console.error(JSON.stringify(error, null, 2))
        return
      }
    } else if (signIn.status === 'needs_second_factor') {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else {
      // Check why the sign-in is not complete
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  return (
    <div>
      <h1>Forgot Password?</h1>

      {/* Step 1 UI: Collect the user's email so you can send them a password reset code */}
      {!codeSent && (
        <form onSubmit={sendCode}>
          <label htmlFor="emailAddress">Provide your email address</label>
          <input
            id="emailAddress"
            type="email"
            placeholder="e.g john@doe.com"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
          {errors.fields.identifier && <p>{errors.fields.identifier.message}</p>}
          <button type="submit" disabled={fetchStatus === 'fetching'}>
            Send password reset code
          </button>
        </form>
      )}

      {/* Step 2 UI: Collect the code provided by the user */}
      {codeSent && signIn.status !== 'needs_new_password' && (
        <form onSubmit={verifyCode}>
          <label htmlFor="code">Enter the password reset code that was sent to your email</label>
          <input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} />
          {errors.fields.code && <p>{errors.fields.code.message}</p>}
          <button type="submit" disabled={fetchStatus === 'fetching'}>
            Verify code
          </button>
        </form>
      )}

      {/* Step 3 UI: Collect the new password from the user */}
      {signIn.status === 'needs_new_password' && (
        <form onSubmit={submitNewPassword}>
          <label htmlFor="password">Enter your new password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.fields.password && <p>{errors.fields.password.message}</p>}
          <button type="submit" disabled={fetchStatus === 'fetching'}>
            Set new password
          </button>
        </form>
      )}

      {/* Step 4 UI: Handle 2FA, or other authentication requirements
      depending on the settings you've enabled in the Clerk Dashboard.
      This may require combining this flow with other custom flows. */}
      {signIn.status === 'needs_second_factor' && (
        <p>2FA is required, but this UI does not handle that.</p>
      )}

      {/* For your debugging purposes. You can just console.log errors,
      but we put them in the UI for convenience */}
      {errors && <pre>{JSON.stringify(errors, null, 2)}</pre>}
    </div>
  )
}