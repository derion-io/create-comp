import React from 'react'
import { Modal } from '../ui/Modal'
import { Box } from '../ui/Box'
import { Text } from '../ui/Text'
import './style.scss'
import isEqual from 'react-fast-compare'

const Component = ({
  visible,
  setVisible,
  options: optionsToSelect,
  onSelectOption
}: {
  visible: boolean,
  setVisible: any,
  options: string[],
  onSelectOption: any
}) => {
  return <Modal
    setVisible={setVisible}
    visible={visible}
    title='Select option'
  >
    <div className='select-token-modal'>
      {
        optionsToSelect.map((content: any, key: number) => {
          return <Box
            key={key}
            className='option'
            onClick={() => {
              onSelectOption(content)
              setVisible(false)
            }}
          >
            <div className='jc-space-between align-item-center'>
              <div className='option__icon-and-name'>
                <Text>{content}</Text>
              </div>
            </div>
          </Box>
        })
      }
    </div>
  </Modal>
}

export const SelectModal = React.memo(Component, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps)
)
