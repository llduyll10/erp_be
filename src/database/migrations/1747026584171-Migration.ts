import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1747026584171 implements MigrationInterface {
    name = 'Migration1747026584171'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('staff_admin', 'staff_general')`);
        await queryRunner.query(`CREATE TYPE "public"."users_user_type_enum" AS ENUM('staff', 'customer', 'supplier', 'contractor')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "encrypted_password" character varying(255) NOT NULL DEFAULT '', "email" character varying(255) NOT NULL, "reset_password_token" character varying(255), "reset_password_sent_at" TIMESTAMP, "current_sign_in_at" TIMESTAMP, "last_sign_in_at" TIMESTAMP, "current_sign_in_ip" character varying(255), "last_sign_in_ip" character varying(255), "sign_in_count" integer NOT NULL DEFAULT '0', "password" character varying(255), "password_confirmation" character varying(255), "locked_at" TIMESTAMP, "failed_attempts" integer NOT NULL DEFAULT '0', "unlock_token" character varying(255), "role" "public"."users_role_enum", "user_type" "public"."users_user_type_enum" NOT NULL, "user_code" character varying(255), CONSTRAINT "UQ_ee6419219542371563e0592db51" UNIQUE ("reset_password_token"), CONSTRAINT "UQ_b800fd597d3e239f367bb8852df" UNIQUE ("unlock_token"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_116eea5d3ceebebe8db0e10c68" ON "users" ("user_type", "email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_116eea5d3ceebebe8db0e10c68"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_user_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
