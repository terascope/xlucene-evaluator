'use strict';

import DateType from './types/dates';
import IpType from './types/ip';
import GeoType from './types/geo';
import StringType from './types/string';
import BaseType from './types/base';

import { ast } from '../../utils';

const typeMapping = {
    date: DateType,
    ip: IpType,
    geo: GeoType
};

export default class TypeManager {
    // TODO:change this to types[] , any[]
    typeList: BaseType[];
    constructor(typeConfig?: object|undefined) {
        this.typeList = this._buildFieldListConfig(typeConfig);
    }

    private _buildFieldListConfig(typeConfig: object|undefined): BaseType[] {
        const typeList:BaseType[] = [];
        const results = {};

        // by default we allow wildcard and regex searches on all fields
        typeList.push(new StringType())

        for (const field in typeConfig) {
            const type = typeConfig[field];
            if (typeMapping[type]) {
                if (!results[type]) results[type] = {};
                results[type][field] = true;
            }
        }

        for (const type in results) {
            const TypeClass = typeMapping[type];
            typeList.push(new TypeClass(results[type]));
        }

        return typeList;
    }

    public processAst(ast: ast): ast {
        return this.typeList.reduce((ast, type) => {
            return type.processAst(ast);
        }, ast);
    }

    public formatData(doc: object): object {
        return this.typeList.reduce((doc, type) => {
            return type.formatData(doc);
        }, doc);
    }

    public injectTypeFilterFns(): object {
        return this.typeList.reduce((prev, type) => {
            const filterFns = type.injectTypeFilterFns();
            if (filterFns !== null) {
                Object.assign(prev, filterFns);
            }
            return prev;
        }, {});
    }
}
