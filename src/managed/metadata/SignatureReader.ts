module pe.managed.metadata {

  /** ECMA-335 II.23.2 */
  export class SignatureReader {

    constructor(private _tables: any[][]) { 
    }

  /** ECMA-335 II.23.2.1 */
    readMethodDefSig(reader: io.BufferReader, def: managed.MethodInfo) {
      
      var callingConvention = <SignatureReader.CallingConvention>reader.readByte();
      var genParamCount = 0;
      if (callingConvention & SignatureReader.CallingConvention.Generic)
        genParamCount = this._readCompressed(reader);

      var paramCount = this._readCompressed(reader);

      var returnType = this.readRefType(reader);

      var params = [];
      for (var i = 0; i < paramCount; i++) {
        var p = this.readParam(reader);
        params.push(p);
      }

    }

    /** ECMA-335 II.23.2.2 */
    readMethodRefSig(reader: io.BufferReader) {
      
      var callingConvention = <SignatureReader.CallingConvention>reader.readByte();
      var genParamCount = 0;
      if (callingConvention & SignatureReader.CallingConvention.Generic)
        genParamCount = this._readCompressed(reader);

      var paramCount = this._readCompressed(reader);

      var returnType = this.readRefType(reader);
      
      var params = [];
      var varargs = [];
      for (var i = 0; i < paramCount; i++) {
        var isvarargs = varargs.length > 0;

        if (!isvarargs) {
          var expectSentinel = reader.peekByte();
          if (expectSentinel === SignatureReader.CallingConvention.Sentinel) {
            reader.readByte();
            isvarargs = true;
          }
        }

        var p = this.readParam(reader);
        if (isvarargs)
          varargs.push(p);
        else
          params.push(p);
      }
      
    }

    /** ECMA-335 II.23.2.3 */
    readStandAloneMethodSig(reader: io.BufferReader, def: any) {

      var callingConvention = <SignatureReader.CallingConvention>reader.readByte();

      var paramCount = this._readCompressed(reader);

      var returnType = this.readRefType(reader);

      var params = [];
      var varargs = [];
      for (var i = 0; i < paramCount; i++) {
        var isvarargs = varargs.length > 0;

        if (!isvarargs) { 
          var expectSentinel = reader.peekByte();
          if (expectSentinel === SignatureReader.CallingConvention.Sentinel) {
            reader.readByte();
            isvarargs = true;
          }
        }
        
        var p = this.readParam(reader);
        if (isvarargs)
          varargs.push(p);
        else
          params.push(p);
      }
      
      
    }

    /** ECMA-335 II.23.2.4 */
    readFieldSig(reader: io.BufferReader, def: managed.FieldInfo) {

      var callingConvention = <SignatureReader.CallingConvention>reader.readByte();
      if (callingConvention !== SignatureReader.CallingConvention.Field)
        throw new Error('Expected CallingConvention.Field, encountered ' + formatEnum(callingConvention, SignatureReader.CallingConvention) + '.');

      var customMod = this.readCustomMod(reader);

      var type = this.readType(reader);

      def.fieldType = type;
    }

    /** ECMA-335 II.23.2.5 */
    readPropertySig(reader: io.BufferReader, def: managed.PropertyInfo) {

      var callingConvention = <SignatureReader.CallingConvention>reader.readByte();
      if (callingConvention !== SignatureReader.CallingConvention.Property)
        throw new Error('Expected CallingConvention.Property, encountered ' + formatEnum(callingConvention, SignatureReader.CallingConvention) + '.');

      var paramCount = this._readCompressed(reader);

      while (true) {
        var customMod = this.readCustomMod(reader);
        if (customMod)
        { /*def.customMod... */ }
        else
          break;
      }

      var type = this.readType(reader);

      var params = [];
      for (var i = 0; i < paramCount; i++) {
        var p = this.readParam(reader);
        params.push(p);
      }

      def.propertyType = type;
      // TODO: def. parameters...
    }

    /** ECMA-335 II.23.2.5 */
    readLocalVarSig(reader: io.BufferReader) {

      var callingConvention = <SignatureReader.CallingConvention>reader.readByte();
      if (callingConvention !== SignatureReader.CallingConvention.Local)
        throw new Error('Expected CallingConvention.Local, encountered ' + formatEnum(callingConvention, SignatureReader.CallingConvention) + '.');

      var count = this._readCompressed(reader);

      var locals = [];
      for (var i = 0; i < count; i++) {

        var peekNext = reader.peekByte();
        if (peekNext === ElementType.TypedByRef) {
          reader.readByte();
          var typedByRef = null; // fetch well-known type for TypedReference
          locals.push();
        }

        var customMods = [];
        var constraints = [];

        while (true) {

          var customMod = this.readCustomMod(reader);
          if (customMod) {
            customMods.push(customMod);
            var eitherFound = true;
          }

          var constraint = this.readConstraint(reader);
          if (constraint) {
            constraints.push(constraint);
            eitherFound = true;
          }

          if (eitherFound) break;
        }

        var isByRef = false;
        peekNext = reader.peekByte();
        if (peekNext === ElementType.ByRef) {
          isByRef = true;
          reader.readByte();
        }

        var type = this.readType(reader);
      }
    }

    readRefType(reader: io.BufferReader): Type {
      return null;
    }

    readConstraint(reader: io.BufferReader): any { 
    }
      
    readParam(reader: io.BufferReader) {
    }

    readCustomMod(reader: io.BufferReader): any {
    }

    readType(reader: io.BufferReader): Type {
      return null;
    }

    private _readCompressed(reader: io.BufferReader): number { 
      var b0 = reader.readByte();
      if (!(b0 & 0x80)) return b0;

      var b1 = reader.readByte();
      if (!(b0 & 0x40))
        return ((b0 & 0x7F) << 8) | b1;

      var b2 = reader.readByte();
      var b3 = reader.readByte();

      return ((b0 & 0x3F) << 24) |
        (b1 << 16) |
        (b2 << 8) |
        b3;
    }
  
    private _readCompressedSigned(reader: io.BufferReader): number {
      // TODO: implement it correctly (ECMA-335 p.257)
      return this._readCompressed(reader);
    }
  }

  export module SignatureReader {

    /** ECMA-335 II.23.2.3 */
    export enum CallingConvention {

      Default = 0x0,

      /** This is a vararg signature too! */
      C = 0x1,

      StdCall = 0x2,

      ThisCall = 0x3,

      FastCall = 0x4,

      VarArg = 0x5,

      Field = 0x06,

      Property = 0x08,

      Local = 0x07,

      Generic = 0x10,

      HasThis = 0x20,

      ExplicitThis = 0x40,

      /** ECMA-335 II.23.1.16 and II.15.3 */
      Sentinel = 0x41

    }


  }
  
}