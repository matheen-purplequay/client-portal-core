import { Menu, MenuButton, MenuItem, MenuItems, Popover } from '@headlessui/react'
import { CheckCircle, ChevronDown, Circle, Delete } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './buttons';

interface DropdownProps {
  title: string;
  dropdownStyle?: "simple" | "default";
  containerClass?: string;
}

interface SimpleDropDownProps extends DropdownProps {
  items: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export default function SimpleDropDown({ title, items, dropdownStyle = "default", selectedValue, onValueChange, containerClass }: SimpleDropDownProps) {

  const randomId = Math.random().toString(36).substring(2, 9);
  const [searchValue, setSearchValue] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  const dropdownButtonStyles = {
    simple: "inline-flex w-full justify-between items-center gap-x-1.5 text-xs font-semibold text-gray-900 cursor-pointer",
    default: "inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs cursor-pointer hover:bg-gray-50"
  };

  const containerClasses = `${containerClass} relative inline-block text-left`;

  useEffect(() => {
    if (!searchValue) {
      setFilteredItems(items);
      return;
    }
    const filtered = items.filter((item) => item.toLowerCase().includes(searchValue.toLowerCase()));
    setFilteredItems(filtered);
  }, [searchValue]);

  return (
    <Menu as="div" className={containerClasses}>
      <div>
        <MenuButton
          className={`cursor-pointer flex flex-col items-start justify-start focus:outline-none focus:ring-0`}
          onClick={() => document.getElementById(`searchBox-${randomId}`)?.focus()}
        >
          <div className="text-xs text-left font-semibold text-slate-700">{title}</div>
          <div className={`${dropdownButtonStyles[dropdownStyle]}`}>
            <span className='text-primary'>{selectedValue}</span>
            <ChevronDown aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
          </div>
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute overflow-hidden flex flex-col border border-slate-200 left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-2xl transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div>
          <input type="text" placeholder='Search'
            id={`searchBox-${randomId}`}
            onChange={(e) => setSearchValue(e.target.value)}
            className='border-b border-slate-200 w-full px-2 py-1 outline-none focus:border-primary focus:outline-none active:outline-none'
          />
        </div>
        <div className="py-1 max-h-[270px] overflow-y-auto">
          {filteredItems.map((item, index) => (
            <MenuItem key={index}>
              <div
                onClick={() => onValueChange(item)}
                className="flex-1 w-full select-none text-left block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
              >
                {item}
              </div>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  )
}

interface KVDropdownOption {
  key: string;
  value: string;
}

interface KVDropdownProps extends DropdownProps {
  items: KVDropdownOption[];
  selectedValue: string;
  onValueChange: (option: KVDropdownOption) => void;
}

export function KVDropDown({ title, items, dropdownStyle = "default", selectedValue, onValueChange, containerClass }: KVDropdownProps) {

  const randomId = Math.random().toString(36).substring(2, 9);
  const [searchValue, setSearchValue] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  const dropdownButtonStyles = {
    simple: "inline-flex w-full justify-between items-center gap-x-1.5 text-xs font-semibold text-gray-900 cursor-pointer",
    default: "inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs cursor-pointer hover:bg-gray-50"
  };

  const containerClasses = `${containerClass} relative inline-block text-left`;

  useEffect(() => {
    if (!selectedValue) selectedValue = items[0].key;
    onValueChange(items.find((item) => item.key === selectedValue)!);
  }, []);

  useEffect(() => {
    const filtered = items.filter((item) => item.key.toLowerCase().includes(searchValue.toLowerCase()));
    setFilteredItems(filtered);
  }, [searchValue]);

  return (
    <Menu as="div" className={containerClasses}>
      <div>
        <MenuButton
          className={`cursor-pointer flex flex-col items-start justify-start focus:outline-none focus:ring-0`}
        >
          <div className="text-xs text-left font-semibold text-slate-700">{title}</div>
          <div className={`${dropdownButtonStyles[dropdownStyle]}`}>
            <span className='text-primary'>{items.find((item) => item.key === selectedValue)?.value}</span>
            <ChevronDown aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
          </div>
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute overflow-hidden flex flex-col border border-slate-200 left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-2xl transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div>
          <input type="text" placeholder='Search'
            id={`searchBox-${randomId}`}
            autoFocus
            onChange={(e) => setSearchValue(e.target.value)}
            className='border-b border-slate-200 w-full px-2 py-1 outline-none focus:border-primary focus:outline-none active:outline-none'
          />
        </div>
        <div className="py-1 max-h-[270px] overflow-y-auto">
          {filteredItems.map((item, index) => (
            <MenuItem key={index}>
              <div
                onClick={() => onValueChange(item)}
                className="flex-1 w-full select-none text-left block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
              >
                {item.value}
              </div>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  )
}


interface MultiSelectDropdownProps<T> {
  title: string;
  items: T[];
  labelKey: keyof T;
  selectedItems?: T[];
  defaultItems?: T[];
  onChange: (selected: T[]) => void;
  dropdownStyle?: "default" | "outlined" | "simple";
}

export function MultiSelectDropdown<T extends Record<string, any>>({
  title,
  items,
  labelKey,
  selectedItems,
  defaultItems,
  onChange,
  dropdownStyle = "default",
}: MultiSelectDropdownProps<T>) {
  const [selected, setSelected] = useState<T[]>(selectedItems || []);
  const [searchValue, setSearchValue] = useState("");
  const randomId = Math.random().toString(36).slice(2, 8);

  useEffect(() => {
    setSelected(selectedItems || []);
  }, [selectedItems]);

  const toggleItem = (item: T) => {
    let updated: T[];
    if (selected.includes(item)) {
      updated = selected.filter((i) => i !== item);
    } else {
      updated = [...selected, item];
    }
    setSelected(updated);
    onChange(updated);
  };

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        String(item[labelKey])
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      ),
    [items, searchValue, labelKey]
  );

  const dropdownButtonStyles = {
    default:
      "mt-1 flex w-auto justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-gray-700 shadow-sm",
    outlined:
      "mt-1 flex w-auto justify-between rounded-md border border-primary bg-white px-3 py-2 text-sm font-normal text-gray-700 shadow-sm",
    simple:
      "flex w-auto justify-between items-center gap-x-1.5 text-xs font-semibold text-gray-900 cursor-pointer",
  };

  return (
    <Popover className="relative inline-block text-left w-56">
      <Popover.Button
        className="cursor-pointer flex flex-col items-start justify-start focus:outline-none overflow-hidden w-full"
        onClick={() =>
          document.getElementById(`searchBox-${randomId}`)?.focus()
        }
      >
        <div className="text-xs text-left font-semibold">{title}</div>
        <div className={dropdownButtonStyles[dropdownStyle]}>
          <span className="truncate text-primary flex-1 text-left">
            {selected.length}/{items.length} selected
          </span>
          <ChevronDown
            aria-hidden="true"
            className="-mr-1 size-5 text-gray-400"
          />
        </div>
      </Popover.Button>

      <Popover.Panel
        className="absolute overflow-hidden flex flex-col border border-slate-200 left-0 z-10 mt-2 w-auto origin-top-right rounded-md bg-white shadow-2xl transition focus:outline-none"
      >
        {/* Search box */}
        <div>
          <input
            type="text"
            placeholder="Search"
            id={`searchBox-${randomId}`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border-b border-slate-200 w-full px-2 py-1 outline-none focus:border-primary"
          />
        </div>

        {/* List */}
        <div className="py-1 max-h-[270px] overflow-y-auto">
          {filteredItems.map((item, index) => {
            const isChecked = selected.includes(item);
            return (
              <div
                key={index}
                onClick={() => toggleItem(item)}
                className={`
                  flex items-center gap-2 w-full select-none text-left px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100
                  ${defaultItems?.includes(item) ? 'bg-gray-100 pointer-events-none' : ''}  
                `}
                >
                {isChecked ? (
                  <CheckCircle className="ml-2 size-4 text-primary" />
                ): (
                  <Circle className="ml-2 size-4 text-slate-500" />
                )}
                <span className={`${isChecked ? '' : 'text-slate-500'}`}>{item[labelKey]}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  readOnly
                  className="pointer-events-none opacity-0 w-0 h-0 -mr-4"
                />
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <Button
            theme="minimal"
            shape="pill"
            className="px-0 outline-0 text-xs font-semibold"
            onClick={() => {
              setSelected(items);
              onChange(items);
            }}
          >
            Select All
          </Button>
          <Button
            theme="minimal"
            shape="pill"
            className="px-0 outline-0 text-xs font-semibold"
            onClick={() => {
              setSelected([]);
              onChange([]);
            }}
          >
            Clear All
          </Button>
        </div>
      </Popover.Panel>
    </Popover>
  );
}


interface ProDropDownProps<T> {
 title: string;
 items: T[];
 idKey: keyof T; // which key acts as unique id
 displayKey: keyof T; // which key to display
 selectedValue?: string | number;
 onValueChange: (item: T) => void;
 dropdownStyle?: "simple" | "default";
 containerClass?: string;
 buttonClass?: string;
 width?: "default" | "full";
}

export function ProDropDown<T>({
 title,
 items,
 idKey,
 displayKey,
 selectedValue,
 onValueChange,
 dropdownStyle = "default",
 containerClass = "",
 buttonClass = "",
 width = "default",
}: ProDropDownProps<T>) {
 const randomId = Math.random().toString(36).substring(2, 9);
 const [searchValue, setSearchValue] = useState("");
 const [filteredItems, setFilteredItems] = useState<T[]>(items);
 const [openUp, setOpenUp] = useState(false);

 const buttonRef = useRef<HTMLDivElement>(null);

 const dropdownButtonStyles = {
  simple:
   `${width === "full" ? "flex" : "inline-flex"} justify-between items-center gap-x-1.5 text-xs font-semibold text-gray-900 cursor-pointer`,
  default:
   `${width === "full" ? "flex" : "inline-flex"} justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs cursor-pointer hover:bg-gray-50`,
 };

 const containerClasses = `${containerClass} relative inline-block text-left`;

 // Ensure initial selection
 useEffect(() => {
  if (items && items.length > 0) {
   const defaultItem =
    selectedValue != null
     ? items.find((item) => String(item[idKey]) === String(selectedValue))
     : items[0];
   if (defaultItem) {
    onValueChange(defaultItem);
   }
  }
 }, []);

 // Search filter
 useEffect(() => {
  if (items && items.length > 0) {
   if (searchValue) {
    setFilteredItems(
     items.filter((item) =>
      String(item[displayKey])
       .toLowerCase()
       .includes(searchValue.toLowerCase())
     )
    );
   } else {
    setFilteredItems(items);
   }
  }
 }, [searchValue, items]);

 // Detect position
 useEffect(() => {
  const checkPosition = () => {
   if (buttonRef.current) {
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 300; // estimated max height
    setOpenUp(spaceBelow < dropdownHeight);
   }
  };

  checkPosition();
  window.addEventListener("resize", checkPosition);
  window.addEventListener("scroll", checkPosition, true);

  return () => {
   window.removeEventListener("resize", checkPosition);
   window.removeEventListener("scroll", checkPosition, true);
  };
 }, []);

 const selectedItem: T | undefined = (items && items.length > 0) ? items.find(
  (item) => String(item[idKey]) === String(selectedValue)
 ) : undefined;

 return (
  <Menu as="div" className={containerClasses}>
   <div ref={buttonRef}>
    <MenuButton className={`cursor-pointer flex flex-col items-start justify-start focus:outline-none focus:ring-0 ${width === "full" ? "w-full" : "w-auto"}`}>
     <div className="text-xs text-left font-semibold text-slate-700">
      {title}
     </div>
     <div className={`${dropdownButtonStyles[dropdownStyle]} ${width === "full" ? "w-full flex-1" : "w-auto max-w-[150px]"} overflow-hidden`}>
      <div className={`text-primary ${buttonClass} ${width === "full" ? "" : "max-w-[130px]"} text-left flex-1 w-full whitespace-nowrap text-ellipsis overflow-hidden`}>
       {selectedItem ? String(selectedItem[displayKey]) : "Select..."}
      </div>
      <ChevronDown aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
     </div>
    </MenuButton>
   </div>

   <MenuItems
    transition
    className={`
     absolute overflow-hidden flex flex-col border border-slate-200 z-10 w-56 rounded-md bg-white shadow-2xl transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in
     ${openUp ? "bottom-full mb-2" : "mt-2 origin-top-right"}
    `}
    >
    <div className='flex items-center gap-2 justify-between pr-1'>
     <input
      type="text"
      placeholder="Search"
      id={`searchBox-${randomId}`}
      autoFocus
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      className="border-b border-slate-200 w-full px-2 py-1 outline-none focus:border-primary"
     />

     {searchValue && <Button theme="simple" className="flex gap-1 items-center aspect-square p-1" shape='pill' onClick={() => setSearchValue('')}><Delete size={16} strokeWidth={1.5} /></Button>}
    </div>
    <div className="py-1 max-h-[270px] overflow-y-auto">
     {filteredItems && filteredItems.length > 0 && filteredItems.map((item, index) => (
      <MenuItem key={index}>
       <div
        onClick={() => onValueChange(item)}
        className="flex-1 w-full select-none text-left block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900"
       >
        {String(item[displayKey])}
       </div>
      </MenuItem>
     ))}
    </div>
   </MenuItems>
  </Menu>
 );
}
 