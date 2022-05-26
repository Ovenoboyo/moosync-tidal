import {
  ExtensionData,
  ExtensionFactory,
  ExtensionPreferenceGroup,
  MoosyncExtensionTemplate
} from '@moosync/moosync-types'
import { MyExtension } from './extension'
import semver from 'semver'

export default class MyExtensionData implements ExtensionData {
  extensionDescriptors: ExtensionFactory[] = [new MyExtensionFactory()]
}

class MyExtensionFactory implements ExtensionFactory {
  async registerPreferences(): Promise<ExtensionPreferenceGroup[]> {
    return [
      {
        type: 'EditText',
        inputType: 'password',
        title: 'Access token',
        description: 'Your Tidal access token if you want to use a custom one',
        key: 'accessToken',
        default: ''
      },
      {
        type: 'ButtonGroup',
        title: 'Clear cache',
        description: 'Clear cached api results',
        key: 'buttons',
        items: [
          {
            key: 'clearCache',
            lastClicked: 0,
            title: 'Clear cache'
          }
        ]
      }
    ]
  }
  async create(): Promise<MoosyncExtensionTemplate> {
    if (!semver.satisfies(process.env.MOOSYNC_VERSION, '>2.1.0')) {
      console.error(
        'This extension was made for Moosync version 1.3.0 or above. Current version is',
        process.env.MOOSYNC_VERSION
      )
    }
    return new MyExtension()
  }
}
