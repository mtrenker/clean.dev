resources:
  - $NAME:
      type: "AWS::Lambda::Function"
      properties:
        name: $NAME
        alias: $ALIAS
        currentversion: $CURRENT_VERSION
        targetversion: $TARGET_VERSION
