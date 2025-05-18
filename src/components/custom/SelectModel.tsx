import { 
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { LocalModel } from "@/api/types";


interface SelectModelProps {
  model: LocalModel | null,
  models: LocalModel[],
  setModel: (Model: LocalModel) => void; 
  className?: string;
}
const SelectModel = ({model, models, setModel, className=""}:SelectModelProps) => {
    const handleChangeValue = (value:string) => {
      models.forEach((me:LocalModel) => {
        if (me.name == value) setModel(me)
      })
    } 

    return (
    <Select 
      value={model?.name} 
      onValueChange={(value) => handleChangeValue(value)} 
      >
      <SelectTrigger 
        className={`${className} bg-card/50 backdrop-blur-sm border border-border/50 text-foreground hover:bg-card/70 focus:ring-primary/20 transition-colors`}
      >
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
        {models.length > 0 && (
          <SelectContent className="bg-card/95 backdrop-blur-md border border-border/50">
          {models.map((m: LocalModel) => (
            <SelectItem 
              key={m.name} 
              value={m.name}
              className="text-foreground/90 hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary"
            >
              {m.name}
            </SelectItem>
          ))}
          </SelectContent>
        )}
    </Select>
  )
}


export default SelectModel
