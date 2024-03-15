import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from "typeorm"
import { User } from "./User";

@Entity()
export class RefreshToken {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type:'timestamp'})
    expiresAt : Date;
    
    @ManyToOne(()=>User)
    user: User;

    @UpdateDateColumn()
    updatedAt : number;

    @CreateDateColumn()
    createdAt : number;
}
