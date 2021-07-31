import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as RoomApp from '../lib/room-app-stack'

test.skip('Empty Stack', () => {
  const app = new cdk.App()
  // WHEN
  const stack = new RoomApp.RoomAppStack(app, 'MyTestStack')
  // THEN
  expectCDK(stack).notTo(matchTemplate({ Resources: {} }))
})
