import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectFilter'
})
export class ObjectFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      for (const key in item) {
        if (item.hasOwnProperty(key) && this.isString(item[key]) && item[key].toLowerCase().includes(searchText)) {
          return true;
        }
      }
      return false;
    });
  }

  private isString(value: any): value is string {
    return typeof value === 'string';
  }
}
