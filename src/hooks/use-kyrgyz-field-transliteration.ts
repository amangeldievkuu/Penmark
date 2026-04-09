import { useCallback, useEffect, useRef, useState } from 'react'
import { isLatinTransliterationInput, transliterateLatinToKyrgyz } from '~/lib/kyrgyz-transliteration'

type TransliterationBuffer = {
  start: number
  raw: string
  rendered: string
}

type TextFieldElement = HTMLInputElement | HTMLTextAreaElement

export function useKyrgyzFieldTransliteration<TField extends TextFieldElement>(
  enabled: boolean,
  value: string,
  onChange: (value: string) => void,
) {
  const [fieldElement, setFieldElement] = useState<TField | null>(null)
  const bufferRef = useRef<TransliterationBuffer | null>(null)
  const enabledRef = useRef(enabled)
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    bufferRef.current = null
  }, [enabled])

  useEffect(() => {
    if (!fieldElement) {
      return
    }

    const handleBeforeInput: EventListener = (event) => {
      const inputEvent = event as InputEvent

      if (!enabledRef.current) {
        return
      }

      const insertedText = inputEvent.data

      if (
        inputEvent.inputType !== 'insertText' ||
        !insertedText ||
        !isLatinTransliterationInput(insertedText)
      ) {
        bufferRef.current = null
        return
      }

      const selectionStart = fieldElement.selectionStart ?? valueRef.current.length
      const selectionEnd = fieldElement.selectionEnd ?? selectionStart
      const previousBuffer = bufferRef.current
      const canExtendBuffer = Boolean(
        previousBuffer &&
        selectionStart === selectionEnd &&
        selectionStart === previousBuffer.start + previousBuffer.rendered.length,
      )

      const rawInput = canExtendBuffer && previousBuffer
        ? `${previousBuffer.raw}${insertedText}`
        : insertedText
      const renderedInput = transliterateLatinToKyrgyz(rawInput)
      const replaceStart = canExtendBuffer && previousBuffer ? previousBuffer.start : selectionStart
      const replaceEnd = canExtendBuffer && previousBuffer
        ? previousBuffer.start + previousBuffer.rendered.length
        : selectionEnd

      inputEvent.preventDefault()
      onChangeRef.current(
        `${valueRef.current.slice(0, replaceStart)}${renderedInput}${valueRef.current.slice(replaceEnd)}`,
      )
      bufferRef.current = {
        start: replaceStart,
        raw: rawInput,
        rendered: renderedInput,
      }

      queueMicrotask(() => {
        if (fieldElement !== document.activeElement) {
          return
        }

        const nextCursor = replaceStart + renderedInput.length
        fieldElement.setSelectionRange(nextCursor, nextCursor)
      })
    }

    const handleKeyDown: EventListener = (event) => {
      const keyboardEvent = event as KeyboardEvent

      if (!enabledRef.current) {
        return
      }

      if (
        keyboardEvent.key === 'Backspace' ||
        keyboardEvent.key === 'Delete' ||
        keyboardEvent.key === 'Enter' ||
        keyboardEvent.key === 'Tab' ||
        keyboardEvent.key.startsWith('Arrow')
      ) {
        bufferRef.current = null
        return
      }

      if (keyboardEvent.key.length === 1 && !/[A-Za-z]/.test(keyboardEvent.key)) {
        bufferRef.current = null
      }
    }

    fieldElement.addEventListener('beforeinput', handleBeforeInput)
    fieldElement.addEventListener('keydown', handleKeyDown)

    return () => {
      fieldElement.removeEventListener('beforeinput', handleBeforeInput)
      fieldElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [fieldElement])

  const fieldRef = useCallback((node: TField | null) => {
    setFieldElement(node)
  }, [])

  return {
    fieldRef,
  }
}
