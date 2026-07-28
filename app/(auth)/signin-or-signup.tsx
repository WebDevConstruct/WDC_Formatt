'use client'

import { useSignIn, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const { signUp } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [code, setCode] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [showMissingRequirements, setShowMissingRequirements] = React.useState(false)

  // Helper to finalize sign-in and navigate
  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          // Handle pending session tasks
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
          console.log(session?.currentTask)
          return
        }

        const url = decorateUrl('/')
        if (url.startsWith('http')) {
          window.location.href = url
        } else {
          router.push(url)
        }
      },
    })
  }

  // Helper to finalize sign-up and navigate
  const finalizeSignUp = async () => {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          // Handle pending session tasks
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
          console.log(session?.currentTask)
          return
        }

        const url = decorateUrl('/')
        if (url.startsWith('http')) {
          window.location.href = url
        } else {
          router.push(url)
        }
      },
    })
  }

  // Step 1: Start sign-in with signUpIfMissing and send email code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Create sign-in for the signUpIfMissing flow.
    // The flow will proceed to verification regardless of whether an account exists or not.
    const { error: createError } = await signIn.create({
      identifier: emailAddress,
      signUpIfMissing: true,
    })
    if (createError) {
      console.error(JSON.stringify(createError, null, 2))
      return
    }

    // Start the verification step
    if (!createError) {
      const { error: sendError } = await signIn.emailCode.sendCode()
      if (sendError) {
        console.error(JSON.stringify(sendError, null, 2))
        return
      }

      setVerifying(true)
    }
  }

  // Step 2: Verification step
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await signIn.emailCode.verifyCode({ code })

    // When the user doesn't exist, verifyCode returns an error with
    // the code 'sign_up_if_missing_transfer'. Check for this error
    // to determine if we need to transfer to sign-up.
    if (error) {
      if (error.errors[0]?.code === 'sign_up_if_missing_transfer') {
        // The user doesn't exist - transfer to sign-up
        await handleTransfer()
        return
      }

      // Some other error occurred
      console.error(JSON.stringify(error, null, 2))
      return
    }

    // The user exists and verification succeeded
    if (signIn.status === 'complete') {
      await finalizeSignIn()
    } else if (signIn.status === 'needs_second_factor') {
      // Handle MFA if required
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === 'needs_client_trust') {
      // Handle client trust if required
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
    } else {
      // Check why the sign-in is not complete
      console.error('Sign-in attempt not complete:', signIn.status)
    }
  }

  // Step 3: Transfer to sign-up
  const handleTransfer = async () => {
    // Create sign-up using transfer.
    // This moves the verified identification from the sign-in to a new sign-up.
    const { error } = await signUp.create({ transfer: true })
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }

    if (signUp.status === 'complete') {
      // No additional requirements - sign-up is complete
      await finalizeSignUp()
    } else if (signUp.status === 'missing_requirements') {
      // Additional fields are required to complete sign-up.
      // Common missing fields include legal_accepted, first_name, last_name, etc.
      // Show a form to collect the missing fields.
      setShowMissingRequirements(true)
    } else {
      console.error('Unexpected sign-up status:', signUp.status)
    }
  }

  // Step 4: Submit missing requirements to complete sign-up
  const handleMissingRequirements = async (e: React.FormEvent) => {
    e.preventDefault()

    // This example handles legal acceptance as an example.
    // You can extend this to handle other missing fields like first_name, last_name, etc.
    // by checking signUp.missingFields and collecting the appropriate values.
    const { error } = await signUp.update({
      legalAccepted: true,
    })
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }

    if (signUp.status === 'complete') {
      await finalizeSignUp()
    } else if (signUp.status === 'missing_requirements') {
      // Still missing other fields
      console.error('Additional fields still required:', signUp.missingFields)
    } else {
      console.error('Unexpected sign-up status:', signUp.status)
    }
  }

  // Step 4 UI: Show missing requirements form
  if (showMissingRequirements) {
    return (
      <>
        <h1>Complete your account</h1>
        <p>Your email has been verified. Please complete the following to create your account.</p>

        <form onSubmit={handleMissingRequirements}>
          {signUp.missingFields.includes('legal_accepted') && (
            <div>
              <label>
                <input type="checkbox" required />I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
          )}
          <button type="submit" disabled={fetchStatus === 'fetching'}>
            Create account
          </button>
        </form>

        <button onClick={() => signIn.reset()}>Start over</button>
      </>
    )
  }

  // Step 2 UI: Show verification code form
  if (verifying) {
    return (
      <>
        <h1>Verify your email</h1>
        <p>
          We sent a verification code to <strong>{emailAddress}</strong>
        </p>
        <form onSubmit={handleVerify}>
          <div>
            <label htmlFor="code">Verification code</label>
            <input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {errors.fields.code && <p>{errors.fields.code.message}</p>}
          </div>
          <button type="submit" disabled={fetchStatus === 'fetching'}>
            Verify
          </button>
        </form>
        <button onClick={() => signIn.emailCode.sendCode()}>Resend code</button>
        <button onClick={() => signIn.reset()}>Start over</button>
      </>
    )
  }

  // Step 1 UI: Show email input form
  return (
    <>
      <h1>Sign in or sign up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Enter email address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
          {errors.fields.identifier && <p>{errors.fields.identifier.message}</p>}
        </div>
        <button type="submit" disabled={fetchStatus === 'fetching'}>
          Continue
        </button>
      </form>
      {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
      {errors && <p>{JSON.stringify(errors, null, 2)}</p>}

      {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default. */}
      <div id="clerk-captcha" />
    </>
  )
}