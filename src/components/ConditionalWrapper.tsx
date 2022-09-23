import { ReactElement } from 'react'

// Return Type 이 undefined 가 될 수 없는 상황이므로 ReactNode 타입을 쓸 수 없다.
interface Props {
  children: ReactElement
  condition: boolean
  wrapper: (children: ReactElement) => ReactElement
}

export default function ConditionalWrapper({ children, condition, wrapper }: Props) {
  return condition ? wrapper(children) : children
}
