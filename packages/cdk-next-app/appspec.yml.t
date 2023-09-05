resources:
  - FUNCTION_NAME:
      type: "AWS::Lambda::Function"
      properties:
        name: FUNCTION_NAME
        alias: 'live'
        currentversion: CURRENT_VERSION
        targetversion: TARGET_VERSION
