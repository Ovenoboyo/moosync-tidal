import {
  ExtensionData,
  ExtensionFactory,
  ExtensionPreferenceGroup,
  MoosyncExtensionTemplate
} from '@moosync/moosync-types'
import { MyExtension } from './extension'

export default class MyExtensionData implements ExtensionData {
  extensionDescriptors: ExtensionFactory[] = [new MyExtensionFactory()]
}

class MyExtensionFactory implements ExtensionFactory {
  async registerPreferences(): Promise<ExtensionPreferenceGroup[]> {
    return [
      {
        type: 'CheckboxGroup',
        key: 'test_checkbox',
        title: 'Checkbox Group',
        description: 'This is a checkbox',
        items: [
          {
            title: 'this is an example checkbox',
            key: 'checkbox_1',
            enabled: false
          },
          {
            title: 'this is an example checkbox 2',
            key: 'checkbox_2',
            enabled: false
          }
        ]
      },
      {
        type: 'DirectoryGroup',
        key: 'test_dirgroup',
        title: 'Directories',
        description: 'This is a checkbox',
        default: []
      },
      {
        type: 'FilePicker',
        key: 'test_filepicker',
        title: 'Directories',
        description: 'This is a checkbox',
        default: ''
      },
      {
        type: 'EditText',
        key: 'test_editText',
        title: 'Input Field',
        description: 'This is an Input Field',
        default: 'This is test value'
      },
      {
        type: 'ButtonGroup',
        key: 'test_buttongroup',
        title: 'Button Group',
        description: 'This is a Button group',
        items: [
          {
            title: 'Button1',
            key: 'button1',
            lastClicked: 0
          },
          {
            title: 'Button2',
            key: 'button2',
            lastClicked: 0
          },
          {
            title: 'Button3',
            key: 'button3',
            lastClicked: 0
          }
        ]
      },
      {
        type: 'ProgressBar',
        key: 'test_progressBar',
        title: 'ProgressBar',
        description: 'Progress bar that shows progress',
        default: 0
      }
    ]
  }

  async create(): Promise<MoosyncExtensionTemplate> {
    return new MyExtension()
  }
}
