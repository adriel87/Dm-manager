'use client'
import { HeroUIProvider } from "@heroui/system"

interface Props {
    children: React.ReactNode
}
export const GeneralProvider = ({children}: Props) =>{
    return <HeroUIProvider>{children}</HeroUIProvider>
}