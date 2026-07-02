import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import { getProContext } from "@lib/data/pro"
import KultCartDrawer from "@modules/home/components/kult/cart-drawer"
import KultHeader from "@modules/home/components/kult/header"
import ProBanner from "@modules/pro/components/pro-banner"
import { ProProvider } from "@modules/pro/context/pro-provider"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const proContext = await getProContext(countryCode)

  return (
    <ProProvider value={proContext}>
      <ProBanner />
      <KultHeader />
      {props.children}
      <KultCartDrawer />
    </ProProvider>
  )
}