module pe.managed.metadata {

  export class CodedIndexReaders {

    resolutionScope = new CodedIndexReader(this._tables, [
      TableKind.Module,
      TableKind.ModuleRef,
      TableKind.AssemblyRef,
      TableKind.TypeRef
    ]);

    typeDefOrRef = new CodedIndexReader(this._tables, [
      TableKind.TypeDef,
      TableKind.TypeRef,
      TableKind.TypeSpec
    ]);

    hasConstant = new CodedIndexReader(this._tables, [
      TableKind.Field,
      TableKind.Param,
      TableKind.Property
    ]);

    hasCustomAttribute = new CodedIndexReader(this._tables, [
      TableKind.MethodDef,
      TableKind.Field,
      TableKind.TypeRef,
      TableKind.TypeDef,
      TableKind.Param,
      TableKind.InterfaceImpl,
      TableKind.MemberRef,
      TableKind.Module,
      0xFF, // none
      TableKind.Property,
      TableKind.Event,
      TableKind.StandAloneSig,
      TableKind.ModuleRef,
      TableKind.TypeSpec,
      TableKind.Assembly,
      TableKind.AssemblyRef,
      TableKind.File,
      TableKind.ExportedType,
      TableKind.ManifestResource,
      TableKind.GenericParam,
      TableKind.GenericParamConstraint,
      TableKind.MethodSpec
    ]);

    customAttributeType = new CodedIndexReader(this._tables, [
      0xFF,
      0xFF,
      TableKind.MethodDef,
      TableKind.MemberRef,
      0xFF
    ]);

    hasDeclSecurity = new CodedIndexReader(this._tables, [
      TableKind.TypeDef,
      TableKind.MethodDef,
      TableKind.Assembly
    ]);

    implementation = new CodedIndexReader(this._tables, [
      TableKind.File,
      TableKind.AssemblyRef,
      TableKind.ExportedType
    ]);

    hasFieldMarshal = new CodedIndexReader(this._tables, [
      TableKind.Field,
      TableKind.Param
    ]);

    typeOrMethodDef = new CodedIndexReader(this._tables, [
      TableKind.TypeDef,
      TableKind.MethodDef
    ]);

    memberForwarded = new CodedIndexReader(this._tables, [
      TableKind.Field,
      TableKind.MethodDef
    ]);

    memberRefParent = new CodedIndexReader(this._tables, [
      TableKind.TypeDef,
      TableKind.TypeRef,
      TableKind.ModuleRef,
      TableKind.MethodDef,
      TableKind.TypeSpec
    ]);

    methodDefOrRef = new CodedIndexReader(this._tables, [
      TableKind.MethodDef,
      TableKind.MemberRef
    ]);

    hasSemantics = new CodedIndexReader(this._tables, [
      TableKind.Event,
      TableKind.Property
    ]);


    constructor(private _tables: any[][]) { 
    }

  }
  
}