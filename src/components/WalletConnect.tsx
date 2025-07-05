import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent } from '@/components/ui/card'

export const WalletConnect = () => {
  return (
    <Card className="w-fit">
      <CardContent className="p-4">
        <ConnectButton />
      </CardContent>
    </Card>
  )
}