import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService{
    constructor(private tenantrepository:Repository<Tenant>){

    }
    async create(tenantData:ITenant){
        return await this.tenantrepository.save(tenantData)
    }
}