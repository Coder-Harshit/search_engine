import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchOptionsProps {
  sort: string
  setSort: (value: string) => void
  searchField: string
  setSearchField: (value: string) => void
}

export function SearchOptions({ sort, setSort, searchField, setSearchField }: SearchOptionsProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance_desc">Relevance (High to Low)</SelectItem>
          <SelectItem value="relevance_asc">Relevance (Low to High)</SelectItem>
          <SelectItem value="date_desc">Date (Newest First)</SelectItem>
          <SelectItem value="date_asc">Date (Oldest First)</SelectItem>
        </SelectContent>
      </Select>

      <Select value={searchField} onValueChange={setSearchField}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Search in" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="title">Title Only</SelectItem>
          <SelectItem value="content">Description Only</SelectItem>
          <SelectItem value="both">Both Title and Description</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

