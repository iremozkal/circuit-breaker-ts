import { IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetByIdBody {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "ID must be an integer." })
  @Min(1, { message: "ID must be greater than zero." })
  id?: number;
}