import * as lambda from '@aws-cdk/aws-lambda'
import { join } from 'path'
import { SymlinkFollowMode } from '@aws-cdk/core'
import * as s3_assets from '@aws-cdk/aws-s3-assets'

const defaultOptions: s3_assets.AssetOptions = {
  followSymlinks: SymlinkFollowMode.BLOCK_EXTERNAL,
}

const lambdaCodeFromNodeModules = (path: string, options = defaultOptions) => {
  const importPath = join('node_modules/', path)
  try {
    import(importPath)
  } catch (e) {
    console.error(e)
    throw new Error('Unable to import code from path: ' + importPath)
  }
  return lambda.Code.fromAsset(importPath, options)
}

export default lambdaCodeFromNodeModules
